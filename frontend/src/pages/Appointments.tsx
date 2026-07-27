import { useState } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const Appointments = () => {
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  const appointments = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      doctor: 'Dr. Smith',
      date: '2026-07-28',
      time: '10:30 AM',
      status: 'scheduled',
      type: 'Check-up',
    },
    {
      id: 2,
      patient: 'Michael Brown',
      doctor: 'Dr. Lee',
      date: '2026-07-28',
      time: '2:00 PM',
      status: 'scheduled',
      type: 'Follow-up',
    },
    {
      id: 3,
      patient: 'Emily Davis',
      doctor: 'Dr. Smith',
      date: '2026-07-27',
      time: '9:00 AM',
      status: 'completed',
      type: 'Consultation',
    },
    {
      id: 4,
      patient: 'James Wilson',
      doctor: 'Dr. Patel',
      date: '2026-07-27',
      time: '11:15 AM',
      status: 'cancelled',
      type: 'Lab Review',
    },
  ];

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  const statusIcons = {
    scheduled: ClockIcon,
    completed: CheckCircleIcon,
    cancelled: XCircleIcon,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Appointments</h1>
          <p className="text-gray-500 text-sm">Schedule and manage patient visits</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('upcoming')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                view === 'upcoming'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setView('past')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                view === 'past'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button className="p-2.5 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition">
              <FunnelIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 gap-4">
        {appointments.map((apt) => {
          const StatusIcon = statusIcons[apt.status as keyof typeof statusIcons];
          return (
            <div
              key={apt.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{apt.patient}</h3>
                  <p className="text-sm text-gray-500">
                    {apt.doctor} • {apt.type}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    {apt.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    {apt.time}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusColors[apt.status as keyof typeof statusColors]
                  }`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>

                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition">
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (if needed) */}
      {appointments.length === 0 && (
        <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
};

export default Appointments;