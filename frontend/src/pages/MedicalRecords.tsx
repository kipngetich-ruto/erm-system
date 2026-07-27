import { useState } from 'react';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const MedicalRecords = () => {
  const [showDecrypted, setShowDecrypted] = useState<{ [key: number]: boolean }>({});

  const records = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      diagnosis: 'Type 2 Diabetes',
      treatment: 'Metformin 500mg daily',
      date: '2026-07-15',
      doctor: 'Dr. Smith',
      encrypted: true,
    },
    {
      id: 2,
      patient: 'Michael Brown',
      diagnosis: 'Hypertension',
      treatment: 'Lisinopril 10mg daily',
      date: '2026-07-10',
      doctor: 'Dr. Lee',
      encrypted: true,
    },
    {
      id: 3,
      patient: 'Emily Davis',
      diagnosis: 'Acute Bronchitis',
      treatment: 'Amoxicillin 500mg 3x daily',
      date: '2026-07-05',
      doctor: 'Dr. Smith',
      encrypted: true,
    },
  ];

  const toggleDecrypt = (id: number) => {
    setShowDecrypted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Medical Records</h1>
          <p className="text-gray-500 text-sm">View and manage patient medical history (AES-256-GCM encrypted)</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          New Record
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search records by patient, diagnosis, or treatment..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{record.patient}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {record.date} • {record.doctor}
                  </p>
                </div>
              </div>

              {/* Encrypted Data */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 lg:flex-col xl:flex-row">
                <button
                  onClick={() => toggleDecrypt(record.id)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center gap-1.5 text-sm font-medium"
                >
                  {showDecrypted[record.id] ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4" /> Hide
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" /> Decrypt
                    </>
                  )}
                </button>
                <button className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecords;