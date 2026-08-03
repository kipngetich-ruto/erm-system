import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import {
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../components/ConfirmDialog';

interface BillingItem {
  id: string;
  patientId: string;
  patientName: string;
  invoiceNumber: string;
  amount: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string | null;
  createdBy: string;
  createdAt: string;
  creatorEmail: string;
}

const Billing = () => {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BillingItem | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      const res = await api.get(`/billing?${params.toString()}`);
      setInvoices(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const patientsRes = await api.get('/patients');
        setPatients(patientsRes.data);
      } catch (err) {
        console.error('Failed to fetch patients', err);
      }
    };
    if (showModal) fetchOptions();
  }, [showModal]);

  const openModal = (invoice?: BillingItem) => {
    setFormError(null);
    setFormSuccess(null);
    if (invoice) {
      setEditing(invoice);
      setFormData({
        patientId: invoice.patientId,
        invoiceNumber: invoice.invoiceNumber,
        amount: parseFloat(invoice.amount),
        description: invoice.description || '',
        status: invoice.status,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '',
        paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString().slice(0, 10) : '',
        paymentMethod: invoice.paymentMethod || '',
      });
    } else {
      setEditing(null);
      setFormData({
        patientId: '',
        invoiceNumber: '',
        amount: '',
        description: '',
        status: 'pending',
        dueDate: '',
        paidAt: '',
        paymentMethod: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!formData.patientId || !formData.invoiceNumber || !formData.amount) {
      setFormError('Please fill all required fields.');
      return;
    }
    try {
      if (editing) {
        await api.put(`/billing/${editing.id}`, formData);
        setFormSuccess('Invoice updated!');
      } else {
        // ✅ Create: omit status, paidAt, paymentMethod
        const { status, paidAt, paymentMethod, ...createData } = formData;
        // Ensure amount is a number
        createData.amount = parseFloat(createData.amount);
        await api.post('/billing', createData);
        setFormSuccess('Invoice created!');
      }
      setTimeout(() => {
        closeModal();
        fetchInvoices();
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save invoice.');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      await api.delete(`/billing/${confirmDialog.id}`);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete.');
    } finally {
      setConfirmDialog({ isOpen: false, id: null });
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'billing';
  const canEdit = user?.role === 'admin' || user?.role === 'billing';
  const canDelete = user?.role === 'admin';

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    overdue: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };

  const statusIcons: Record<string, any> = {
    pending: ClockIcon,
    paid: CheckCircleIcon,
    overdue: XMarkIcon,
    cancelled: XMarkIcon,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <CreditCardIcon className="w-8 h-8 text-blue-600" />
            Billing
          </h1>
          <p className="text-gray-500 text-sm">Manage invoices and payments</p>
        </div>
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Invoice
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setFilters({ status: '' })}
            className="px-4 py-2.5 bg-gray-200/80 hover:bg-gray-300/80 rounded-xl text-gray-700 font-medium transition"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-center">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const StatusIcon = statusIcons[inv.status] || ClockIcon;
            return (
              <div key={inv.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                      <CreditCardIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{inv.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">{inv.patientName}</p>
                      <p className="text-xs text-gray-400">€{parseFloat(inv.amount).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        statusColors[inv.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                    {canEdit && (
                      <button onClick={() => openModal(inv)} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(inv.id)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {inv.description && (
                  <div className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                    {inv.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? 'Edit Invoice' : 'New Invoice'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{formError}</div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">{formSuccess}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient *</label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    disabled={!!editing}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invoice Number *</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    disabled={!!editing}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ✅ Only show these fields when editing */}
                {editing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <input
                        type="text"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Paid Date</label>
                      <input
                        type="date"
                        name="paidAt"
                        value={formData.paidAt}
                        onChange={handleChange}
                        className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Invoice?"
        message="This action cannot be undone. The invoice will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
};

export default Billing;
