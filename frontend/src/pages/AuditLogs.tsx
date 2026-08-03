import { useState, useEffect } from 'react';
import { auditApi } from '../api/endpoints';
import {
  ShieldCheckIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
  status: string;
  timestamp: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLogs = async (pageNum: number) => {
    try {
      setLoading(true);
      const offset = (pageNum - 1) * limit;
      const res = await auditApi.getLogs(limit, offset);
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const statusColors: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    error: 'bg-rose-100 text-rose-700',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          Audit Logs
        </h1>
        <p className="text-gray-500 text-sm">Track all system activities for compliance and security</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-center">{error}</div>
      ) : logs.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
          <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-b border-gray-200/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-all duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{log.userId || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{log.resource}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.ip}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[log.status] || 'bg-gray-100 text-gray-700'}`}>
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
              <span>Showing {logs.length} of {total} entries</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-white border border-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">Page {page} of {totalPages || 1}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-white border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
