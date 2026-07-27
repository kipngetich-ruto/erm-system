import { Link } from 'react-router-dom';
import {
  ShieldExclamationIcon,
  HomeIcon,
  ArrowLeftIcon,
  LockClosedIcon, // ✅ This exists in outline
} from '@heroicons/react/24/outline';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-red-50/30 to-amber-50/30 p-4">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 shadow-rose-500/10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-rose-500 to-rose-600 p-5 rounded-3xl shadow-xl shadow-rose-500/30">
                <ShieldExclamationIcon className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30">
                <LockClosedIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight text-center">
            Access Denied
          </h1>

          <div className="mt-3 mb-6 text-center">
            <p className="text-gray-600 text-base">
              You don't have permission to view this page.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              If you believe this is an error, contact your administrator.
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/60"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white/80 text-gray-400">🔒 Secure</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <HomeIcon className="w-5 h-5" />
              Return to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Go Back
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100/60 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400 bg-gray-50/80 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
              Restricted Area
            </span>
            <span className="w-px h-4 bg-gray-200 hidden sm:block"></span>
            <span className="flex items-center gap-1.5 text-gray-400 bg-gray-50/80 px-3 py-1.5 rounded-full">
              🔑 Role-Based Access
            </span>
            <span className="w-px h-4 bg-gray-200 hidden sm:block"></span>
            <span className="flex items-center gap-1.5 text-gray-400 bg-gray-50/80 px-3 py-1.5 rounded-full">
              🛡️ AES-256-GCM
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 EMR System • Security First
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;