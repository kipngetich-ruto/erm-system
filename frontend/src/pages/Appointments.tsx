import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import {
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  duration: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
  createdAt: string;
}

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  scheduledDate: string;
  duration: string;
  reason: string;
  notes: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

const Appointments = () => {
  const { user } = useAuthStore();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    doctorId: '',
    scheduledDate: '',
    duration: '30 minutes',
    reason: '',
    notes: '',
    status: 'scheduled',
  });
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; email: string }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      const res = await api.get(`/appointments?${params.toString()}`);
      setAppointments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  // Fetch patients and doctors when modal opens
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

  const openModal = (appointment?: Appointment) => {
    setFormError(null);
    setFormSuccess(null);
    if (appointment) {
      setEditingAppointment(appointment);
      // ✅ Only set editable fields
      setFormData({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        scheduledDate: new Date(appointment.scheduledDate).toISOString().slice(0, 16),
        duration: appointment.duration || '30 minutes',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status,
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        doctorId: '',
        scheduledDate: '',
        duration: '30 minutes',
        reason: '',
        notes: '',
        status: 'scheduled',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.patientId || !formData.doctorId || !formData.scheduledDate) {
      setFormError('Please fill all required fields (Patient, Doctor, Date/Time).');
      return;
    }

    try {
      if (editingAppointment) {
        // ✅ Exclude patientId and doctorId (backend blocks changes)
        const { patientId, doctorId, ...updateData } = formData;
        await api.put(`/appointments/${editingAppointment.id}`, updateData);
        setFormSuccess('Appointment updated successfully!');
      } else {
        await api.post('/appointments', formData);
        setFormSuccess('Appointment created successfully!');
      }
      setTimeout(() => {
        closeModal();
        fetchAppointments();
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save appointment.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err: any) {
      // Show inline error – for now, alert remains but we can replace with a toast later
      alert(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const canEdit = ['admin', 'receptionist', 'doctor'].includes(user?.role || '');
  const canDelete = ['admin', 'doctor'].includes(user?.role || '');
  const canCreate = ['admin', 'receptionist'].includes(user?.role || '');

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    no_show: 'bg-amber-100 text-amber-700',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Appointments</h1>
          <p className="text-gray-500 text-sm">Schedule and manage patient visits</p>
        </div>
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Appointment
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
            className="px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
            className="px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFilters({ status: '', fromDate: '', toDate: '' })}
            className="px-4 py-2.5 bg-gray-200/80 hover:bg-gray-300/80 rounded-xl text-gray-700 font-medium transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-center">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No appointments found</p>
          {canCreate && (
            <button
              onClick={() => openModal()}
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
            >
              Schedule First Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{apt.patientName || 'Unknown Patient'}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{apt.doctorName || 'Unknown Doctor'}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{apt.reason || 'No reason'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    {new Date(apt.scheduledDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    {new Date(apt.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      statusColors[apt.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => openModal(apt)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    >
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient *</label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor *</label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30 minutes"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Reason for appointment"
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
                    placeholder="Additional notes"
                  />
                </div>
                {editingAppointment && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                )}
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
                  {editingAppointment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;