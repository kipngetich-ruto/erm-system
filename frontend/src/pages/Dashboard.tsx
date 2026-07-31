import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { dashboardApi } from '../api/endpoints';
import {
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PlusCircleIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  activeRecords: number;
  pendingBills: number;
}

interface Activity {
  action: string;
  time: string;
  type: 'update' | 'lab' | 'pharma' | 'register' | 'other';
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getActivities(),
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build stats cards dynamically
  const statsCards = stats ? [
    { name: 'Total Patients', value: stats.totalPatients.toLocaleString(), change: null, icon: UserGroupIcon, bg: 'bg-blue-50', text: 'text-blue-600' },
    { name: "Today's Appointments", value: stats.todayAppointments.toLocaleString(), change: null, icon: CalendarIcon, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { name: 'Active Records', value: stats.activeRecords.toLocaleString(), change: null, icon: ClipboardDocumentCheckIcon, bg: 'bg-purple-50', text: 'text-purple-600' },
    { name: 'Pending Bills', value: stats.pendingBills.toLocaleString(), change: null, icon: CurrencyDollarIcon, bg: 'bg-amber-50', text: 'text-amber-600' },
  ] : [];

  const quickActions = [
    { name: 'Register Patient', icon: PlusCircleIcon, color: 'blue', path: '/register-patient' },
    { name: 'New Appointment', icon: CalendarIcon, color: 'emerald', path: '/appointments/new' },
    { name: 'Create Record', icon: ClipboardDocumentCheckIcon, color: 'purple', path: '/records/new' },
    { name: 'View Audit Log', icon: DocumentMagnifyingGlassIcon, color: 'amber', path: '/audit' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-xl text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-gray-500 flex items-center gap-1">
              <span className="capitalize font-medium text-gray-700">{user?.role}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-105 transition`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
              {/* We removed change badge since it's not coming from backend yet */}
              {stat.change !== null && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mt-4">{stat.value}</p>
            <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Bottom Grid: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition">
              View All →
            </button>
          </div>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100/50 hover:bg-white transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'lab' ? 'bg-purple-500' :
                      activity.type === 'pharma' ? 'bg-emerald-500' :
                      activity.type === 'register' ? 'bg-amber-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-700 font-medium">{activity.action}</span>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-gray-200/50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const colorMap = {
                blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
                emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
                purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
                amber: 'bg-amber-50 hover:bg-amber-100 text-amber-700',
              };
              return (
                <button
                  key={action.name}
                  onClick={() => navigate(action.path)}
                  className={`${colorMap[action.color as keyof typeof colorMap]} p-4 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] shadow-sm`}
                >
                  <action.icon className="w-5 h-5 mx-auto mb-1.5" />
                  {action.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
