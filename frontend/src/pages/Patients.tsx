import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { patientApi } from '../api/endpoints';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
// import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  registeredBy: string;
  createdAt: string;
  updatedAt: string;
}

const Patients = () => {
  const { user } = useAuthStore();
  // const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});

  // Fetch patients
  const fetchPatients = async (query?: string) => {
    try {
      setLoading(true);
      const res = await patientApi.getAll(query);
      setPatients(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Search handler (debounced)
  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Open modal for new/edit
  const openModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData(patient);
    } else {
      setEditingPatient(null);
      setFormData({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
    setFormData({});
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save patient (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await patientApi.update(editingPatient.id, formData);
      } else {
        await patientApi.create(formData);
      }
      closeModal();
      fetchPatients(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save patient');
    }
  };

  // Delete patient
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await patientApi.delete(id);
      fetchPatients(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'receptionist';
  const canDelete = user?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Patients</h1>
          <p className="text-gray-500 text-sm">Manage all patient records securely</p>
        </div>
        {canEdit && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Register New
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-center">
          {error}
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No patients found</p>
          {canEdit && (
            <button
              onClick={() => openModal()}
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
            >
              Register First Patient
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-b border-gray-200/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    DOB
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-all duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {p.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.fullName}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.dob ? new Date(p.dob).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        {p.phone && (
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                            {p.phone}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                            {p.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {canEdit && (
                        <button
                          onClick={() => openModal(p)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50 text-xs text-gray-400 flex justify-between items-center">
            <span>Showing {patients.length} patients</span>
            <span>Secure • Encrypted</span>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPatient ? 'Edit Patient' : 'Register New Patient'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone || ''}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition"
                >
                  {editingPatient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;