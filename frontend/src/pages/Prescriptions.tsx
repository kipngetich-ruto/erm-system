import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../components/ConfirmDialog';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  pharmacistId: string | null;
  medication: string;
  dosage: string;
  instructions: string;
  status: 'active' | 'dispensed' | 'cancelled' | 'expired';
  issuedAt: string;
  dispensedAt: string | null;
  expiresAt: string | null;
}

const Prescriptions = () => {
  const { user } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; email: string }[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      const res = await api.get(`/prescriptions?${params.toString()}`);
      setPrescriptions(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [filters]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/users?role=doctor'),
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error('Failed to fetch options', err);
      }
    };
    if (showModal) fetchOptions();
  }, [showModal]);

  const openModal = (prescription?: Prescription) => {
    setFormError(null);
    setFormSuccess(null);
    if (prescription) {
      setEditing(prescription);
      setFormData({
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        medication: prescription.medication,
        dosage: prescription.dosage,
        instructions: prescription.instructions || '',
        status: prescription.status,
        expiresAt: prescription.expiresAt ? new Date(prescription.expiresAt).toISOString().slice(0, 10) : '',
      });
    } else {
      setEditing(null);
      setFormData({
        patientId: '',
        doctorId: '',
        medication: '',
        dosage: '',
        instructions: '',
        status: 'active',
        expiresAt: '',
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
    if (!formData.patientId || !formData.doctorId || !formData.medication || !formData.dosage) {
      setFormError('Please fill all required fields.');
      return;
    }
    try {
      if (editing) {
        await api.put(`/prescriptions/${editing.id}`, formData);
        setFormSuccess('Prescription updated!');
      } else {
        const { status, ...createData } = formData;
        await api.post('/prescriptions', createData);
        setFormSuccess('Prescription created!');
      }
      setTimeout(() => {
        closeModal();
        fetchPrescriptions();
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save prescription.');
    }
  };

  const handleDispense = async (id: string) => {
    if (!confirm('Mark this prescription as dispensed?')) return; // still uses confirm – can later replace with dialog
    try {
      await api.put(`/prescriptions/${id}`, { status: 'dispensed' });
      fetchPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispense.');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      await api.delete(`/prescriptions/${confirmDialog.id}`);
      fetchPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete.');
    } finally {
      setConfirmDialog({ isOpen: false, id: null }); // reset after
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'doctor';
  const canEdit = user?.role === 'admin' || user?.role === 'doctor';
  const canDelete = user?.role === 'admin';
  const canDispense = user?.role === 'pharmacist';

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-700',
    dispensed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    expired: 'bg-amber-100 text-amber-700',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Prescriptions</h1>
          <p className="text-gray-500 text-sm">Manage patient medications (encrypted)</p>
        </div>
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Prescription
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
            <option value="active">Active</option>
            <option value="dispensed">Dispensed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
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
      ) : prescriptions.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <p className="text-gray-500 text-lg">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{p.patientName}</h3>
                    <p className="text-sm text-gray-500">
                      {p.medication} – {p.dosage}
                    </p>
                    <p className="text-xs text-gray-400">Dr. {p.doctorName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      statusColors[p.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                  {canDispense && p.status === 'active' && (
                    <button
                      onClick={() => handleDispense(p.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <CheckCircleIcon className="w-4 h-4" /> Dispense
                    </button>
                  )}
                  {canEdit && (
                    <button onClick={() => openModal(p)} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? 'Edit Prescription' : 'New Prescription'}
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
                  <label className="block text-sm font-medium text-gray-700">Doctor *</label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    disabled={!!editing}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medication *</label>
                  <input
                    type="text"
                    name="medication"
                    value={formData.medication}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dosage *</label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expires At</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="dispensed">Dispensed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
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
        title="Delete Prescription?"
        message="This action cannot be undone. The prescription will be permanently removed from the system."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
};

export default Prescriptions;
