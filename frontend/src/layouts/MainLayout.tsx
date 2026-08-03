import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  CreditCardIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

// Install: npm install @heroicons/react

const MainLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard', roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'receptionist', 'billing'] },
    { name: 'Patients', icon: UsersIcon, path: '/patients', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Appointments', icon: CalendarDaysIcon, path: '/appointments', roles: ['admin', 'doctor', 'receptionist'] },
    { name: 'Medical Records', icon: ClipboardDocumentListIcon, path: '/records', roles: ['admin', 'doctor'] },
    { name: 'Prescriptions', icon: ClipboardDocumentCheckIcon, path: '/prescriptions', roles: ['admin', 'doctor', 'pharmacist', 'nurse'] },
    { name: 'Lab Results', icon: BeakerIcon, path: '/lab-results', roles: ['admin', 'doctor', 'lab_tech', 'nurse'] },
    { name: 'Billing', icon: CreditCardIcon, path: '/billing', roles: ['admin', 'billing'] },
    { name: 'Audit Logs', icon: DocumentTextIcon, path: '/audit', roles: ['admin'] },
    { name: 'Security', icon: ShieldCheckIcon, path: '/security', roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'receptionist', 'billing'] },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role || '') || user?.role === 'admin'
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/30">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-xl flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-white/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">EMR System</h1>
              <p className="text-xs text-gray-500 capitalize">Role: {user?.role || 'Guest'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/50 bg-white/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
              <UserCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-gray-800">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Unknown'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 bg-red-50/50 hover:bg-red-100/70 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium border border-red-200/30"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
