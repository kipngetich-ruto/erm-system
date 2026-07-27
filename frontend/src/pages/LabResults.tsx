import { useState } from 'react';
import {
  BeakerIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const LabResults = () => {
  const results = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      test: 'Complete Blood Count',
      date: '2026-07-25',
      status: 'completed',
      technician: 'Dr. Patel',
    },
    {
      id: 2,
      patient: 'Michael Brown',
      test: 'Lipid Panel',
      date: '2026-07-23',
      status: 'pending',
      technician: '—',
    },
    {
      id: 3,
      patient: 'Emily Davis',
      test: 'Urinalysis',
      date: '2026-07-20',
      status: 'completed',
      technician: 'Dr. Chen',
    },
    {
      id: 4,
      patient: 'James Wilson',
      test: 'Thyroid Function',
      date: '2026-07-18',
      status: 'cancelled',
      technician: '—',
    },
  ];

  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  const statusIcons = {
    completed: CheckCircleIcon,
    pending: ClockIcon,
    cancelled: XCircleIcon,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Lab Results</h1>
          <p className="text-gray-500 text-sm">Manage laboratory tests and results</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <DocumentArrowUpIcon className="w-5 h-5" />
            Upload Result
          </button>
          <button className="bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-2.5 px-6 rounded-xl border border-white/50 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Request Test
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lab results..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result) => {
          const StatusIcon = statusIcons[result.status as keyof typeof statusIcons];
          return (
            <div
              key={result.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                    <BeakerIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{result.test}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <UserCircleIcon className="w-3.5 h-3.5" />
                      {result.patient}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusColors[result.status as keyof typeof statusColors]
                  }`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100/50 flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Date</p>
                  <p className="text-gray-700 font-medium">{result.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Technician</p>
                  <p className="text-gray-700 font-medium">{result.technician}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition">
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LabResults;