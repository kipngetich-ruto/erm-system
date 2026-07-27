import { useState } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon, // ✅ Added
  XCircleIcon,      // ✅ Added
} from '@heroicons/react/24/outline';

const AuditLogs = () => {
  const [filter, setFilter] = useState('all');

  const logs = [
    {
      id: 1,
      user: 'Dr. Smith',
      action: 'LOGIN',
      resource: '/auth/login',
      ip: '192.168.1.1',
      timestamp: '2026-07-27 15:32:21',
      status: 'success',
    },
    {
      id: 2,
      user: 'Dr. Smith',
      action: 'CREATE_RECORD',
      resource: '/records',
      ip: '192.168.1.1',
      timestamp: '2026-07-27 15:35:10',
      status: 'success',
    },
    {
      id: 3,
      user: 'Nurse Johnson',
      action: 'VIEW_PATIENT',
      resource: '/patients/1042',
      ip: '192.168.1.45',
      timestamp: '2026-07-27 15:40:55',
      status: 'success',
    },
    {
      id: 4,
      user: 'Unknown',
      action: 'LOGIN_FAILED',
      resource: '/auth/login',
      ip: '10.0.0.99',
      timestamp: '2026-07-27 15:45:02',
      status: 'failed',
    },
    {
      id: 5,
      user: 'Admin',
      action: 'ROLE_CHANGE',
      resource: '/users/2031/role',
      ip: '192.168.1.10',
      timestamp: '2026-07-27 15:50:30',
      status: 'success',
    },
  ];

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.action.includes(filter.toUpperCase()));

  const actionColors: Record<string, string> = {
    LOGIN: 'bg-blue-100 text-blue-700',
    CREATE_RECORD: 'bg-emerald-100 text-emerald-700',
    VIEW_PATIENT: 'bg-purple-100 text-purple-700',
    LOGIN_FAILED: 'bg-rose-100 text-rose-700',
    ROLE_CHANGE: 'bg-amber-100 text-amber-700',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            Audit Logs
          </h1>
          <p className="text-gray-500 text-sm">Track all system activities for compliance and security</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50 shadow-md flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          Last 24 hours
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit logs..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="view">View</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
            <button className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-600 hover:bg-gray-100 transition">
              <FunnelIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-b border-gray-200/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/30 transition-all duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-800">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                        actionColors[log.action] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{log.resource}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.ip}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                      ) : (
                        <XCircleIcon className="w-3.5 h-3.5" />
                      )}
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50 text-xs text-gray-400 flex justify-between items-center">
          <span>Showing {filteredLogs.length} of {logs.length} entries</span>
          <span>Retention: 90 days</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;