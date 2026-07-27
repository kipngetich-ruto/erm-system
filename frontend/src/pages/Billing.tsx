import { useState } from 'react';
import {
  CreditCardIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Billing = () => {
  const invoices = [
    {
      id: 'INV-2026-001',
      patient: 'Sarah Johnson',
      amount: 245.50,
      date: '2026-07-25',
      dueDate: '2026-08-25',
      status: 'paid',
    },
    {
      id: 'INV-2026-002',
      patient: 'Michael Brown',
      amount: 180.00,
      date: '2026-07-20',
      dueDate: '2026-08-20',
      status: 'pending',
    },
    {
      id: 'INV-2026-003',
      patient: 'Emily Davis',
      amount: 320.75,
      date: '2026-07-15',
      dueDate: '2026-08-15',
      status: 'overdue',
    },
    {
      id: 'INV-2026-004',
      patient: 'James Wilson',
      amount: 95.00,
      date: '2026-07-10',
      dueDate: '2026-08-10',
      status: 'paid',
    },
  ];

  const statusColors = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-rose-100 text-rose-700',
  };

  const statusIcons = {
    paid: CheckCircleIcon,
    pending: ClockIcon,
    overdue: XCircleIcon,
  };

  const totalPending = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Billing</h1>
          <p className="text-gray-500 text-sm">Manage invoices and payments</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/50 shadow-md flex items-center gap-3">
            <span className="text-sm text-gray-500">Pending Total:</span>
            <span className="text-xl font-extrabold text-amber-600">€{totalPending.toFixed(2)}</span>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-gray-200/50 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices by ID, patient, or amount..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-b border-gray-200/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {invoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.status as keyof typeof statusIcons];
                return (
                  <tr key={invoice.id} className="hover:bg-blue-50/30 transition-all duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm font-semibold text-gray-800">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{invoice.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">€{invoice.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{invoice.dueDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          statusColors[invoice.status as keyof typeof statusColors]
                        }`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50 text-xs text-gray-400 flex justify-between items-center">
          <span>Showing {invoices.length} invoices</span>
          <span>Total: €{invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Billing;