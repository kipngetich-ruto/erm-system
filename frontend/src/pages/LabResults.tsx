import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import {
  BeakerIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../components/ConfirmDialog';

interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  technicianId: string | null;
  testType: string;
  result: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  requestedAt: string;
  completedAt: string | null;
}

const LabResults = () => {
  const { user } = useAuthStore();
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; email: string }[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LabResult | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Upload result modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingResult, setUploadingResult] = useState<LabResult | null>(null);
  const [resultText, setResultText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      const res = await api.get(`/lab-results?${params.toString()}`);
      setResults(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
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

  const openModal = (result?: LabResult) => {
    setFormError(null);
    setFormSuccess(null);
    if (result) {
      setEditing(result);
      setFormData({
        patientId: result.patientId,
        doctorId: result.doctorId,
        testType: result.testType,
        notes: result.notes || '',
        status: result.status,
      });
    } else {
      setEditing(null);
      setFormData({
        patientId: '',
        doctorId: '',
        testType: '',
        notes: '',
        status: 'pending',
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
    if (!formData.patientId || !formData.doctorId || !formData.testType) {
      setFormError('Please fill all required fields.');
      return;
    }
    try {
      if (editing) {
        await api.put(`/lab-results/${editing.id}`, formData);
        setFormSuccess('Lab result updated!');
      } else {
        // ✅ Create: omit status
        const { status, ...createData } = formData;
        await api.post('/lab-results', createData);
        setFormSuccess('Lab request created!');
      }
      setTimeout(() => {
        closeModal();
        fetchResults();
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save.');
    }
  };

  const openUploadModal = (result: LabResult) => {
    setUploadingResult(result);
    setResultText('');
    setUploadError(null);
    setShowUploadModal(true);
  };

  const handleUploadResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultText.trim()) {
      setUploadError('Please enter the test result.');
      return;
    }
    try {
      await api.put(`/lab-results/${uploadingResult!.id}`, { result: resultText.trim() });
      setShowUploadModal(false);
      fetchResults();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload result.');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      await api.delete(`/lab-results/${confirmDialog.id}`);
      fetchResults();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete.');
    } finally {
      setConfirmDialog({ isOpen: false, id: null });
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'doctor';
  const canEdit = user?.role === 'admin' || user?.role === 'doctor';
  const canDelete = user?.role === 'admin';
  const canUploadResult = user?.role === 'lab_tech';
  const canManageStatus = user?.role === 'lab_tech' || user?.role === 'admin';

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <BeakerIcon className="w-8 h-8 text-blue-600" />
            Lab Results
          </h1>
          <p className="text-gray-500 text-sm">Manage laboratory tests and results (encrypted)</p>
        </div>
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Request Test
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
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
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
      ) : results.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <BeakerIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No lab results found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                    <BeakerIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{r.patientName}</h3>
                    <p className="text-sm text-gray-500">{r.testType}</p>
                    <p className="text-xs text-gray-400">Dr. {r.doctorName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      statusColors[r.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                  {canUploadResult && r.status !== 'completed' && r.status !== 'cancelled' && (
                    <button
                      onClick={() => openUploadModal(r)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <DocumentArrowUpIcon className="w-4 h-4" /> Upload Result
                    </button>
                  )}
                  {canManageStatus && r.status !== 'completed' && r.status !== 'cancelled' && (
                    <select
                      value={r.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await api.put(`/lab-results/${r.id}`, { status: newStatus });
                          fetchResults();
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Failed to update status');
                        }
                      }}
                      className="text-xs px-2 py-1 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                  {canEdit && (
                    <button onClick={() => openModal(r)} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(r.id)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {r.result && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <strong>Result:</strong> {r.result}
                </div>
              )}
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
                {editing ? 'Edit Lab Request' : 'New Lab Request'}
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
                  <label className="block text-sm font-medium text-gray-700">Test Type *</label>
                  <input
                    type="text"
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
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
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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

      {/* Upload Result Modal */}
      {showUploadModal && uploadingResult && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Upload Test Result</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUploadResult} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{uploadError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Result *</label>
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  rows={4}
                  placeholder="Enter the test result (will be encrypted)"
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">The result will be encrypted before saving.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition">
                  Upload Result
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
        title="Delete Lab Result?"
        message="This action cannot be undone. The lab result will be permanently removed from the system."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
};

export default LabResults;
