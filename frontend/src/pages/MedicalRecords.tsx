import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Record {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  visitDate: string;
  isFollowUp: boolean;
  createdAt: string;
}

const MedicalRecords = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showDecrypted, setShowDecrypted] = useState<{ [key: string]: boolean }>({});
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; email: string }[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medical-records', { params: { search } });
      setRecords(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search]);

  // Fetch patients & doctors for modal
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

  const toggleDecrypt = (id: string) => {
    setShowDecrypted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openModal = (record?: Record) => {
    setFormError(null);
    setFormSuccess(null);
    if (record) {
      setEditingRecord(record);
      setFormData({
        patientId: record.patientId,
        doctorId: record.doctorId,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        notes: record.notes || '',
        visitDate: record.visitDate ? new Date(record.visitDate).toISOString().slice(0, 10) : '',
        isFollowUp: record.isFollowUp || false,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        patientId: '',
        doctorId: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        visitDate: '',
        isFollowUp: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.patientId || !formData.doctorId || !formData.diagnosis || !formData.treatment) {
      setFormError('Please fill all required fields.');
      return;
    }

    try {
      if (editingRecord) {
        const { patientId, doctorId, ...updateData } = formData;
        await api.put(`/medical-records/${editingRecord.id}`, updateData);
        setFormSuccess('Record updated successfully!');
      } else {
        await api.post('/medical-records', formData);
        setFormSuccess('Record created successfully!');
      }
      setTimeout(() => {
        closeModal();
        fetchRecords();
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save record.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/medical-records/${id}`);
      fetchRecords();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'doctor';
  const canDelete = user?.role === 'admin' || user?.role === 'doctor';
  const canCreate = user?.role === 'admin' || user?.role === 'doctor';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Medical Records</h1>
          <p className="text-gray-500 text-sm">View and manage patient medical history (AES-256-GCM encrypted)</p>
        </div>
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Record
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search records by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-center">{error}</div>
      ) : records.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <LockClosedIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No medical records found</p>
          {canCreate && (
            <button
              onClick={() => openModal()}
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
            >
              Create First Record
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{record.patientName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(record.visitDate).toLocaleDateString()}
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-blue-600">{record.doctorName}</span>
                      {record.isFollowUp && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Follow-up</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/50">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Diagnosis</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {showDecrypted[record.id] ? (
                        <span className="text-gray-800 font-medium">{record.diagnosis}</span>
                      ) : (
                        <span className="text-gray-400 font-mono flex items-center gap-1">
                          <LockClosedIcon className="w-3.5 h-3.5 text-blue-500" />
                          •••••••••••••
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/50">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Treatment</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {showDecrypted[record.id] ? (
                        <span className="text-gray-800 font-medium">{record.treatment}</span>
                      ) : (
                        <span className="text-gray-400 font-mono flex items-center gap-1">
                          <LockClosedIcon className="w-3.5 h-3.5 text-blue-500" />
                          •••••••••••••
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/50">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Notes</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {showDecrypted[record.id] ? (
                        <span className="text-gray-800 text-sm">{record.notes || '-'}</span>
                      ) : (
                        <span className="text-gray-400 font-mono flex items-center gap-1">
                          <LockClosedIcon className="w-3.5 h-3.5 text-blue-500" />
                          •••••••••••••
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDecrypt(record.id)}
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center gap-1.5 text-sm font-medium"
                  >
                    {showDecrypted[record.id] ? (
                      <><EyeSlashIcon className="w-4 h-4" /> Hide</>
                    ) : (
                      <><EyeIcon className="w-4 h-4" /> Decrypt</>
                    )}
                  </button>
                  {canEdit && (
                    <button onClick={() => openModal(record)} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(record.id)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRecord ? 'Edit Medical Record' : 'Create Medical Record'}
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
                    disabled={!!editingRecord}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!!editingRecord}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                  <input
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isFollowUp"
                      checked={formData.isFollowUp}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    Follow-up visit
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Diagnosis *</label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Enter diagnosis (will be encrypted)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Treatment *</label>
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Enter treatment plan (will be encrypted)"
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
                    placeholder="Additional notes (will be encrypted)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition">
                  {editingRecord ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;