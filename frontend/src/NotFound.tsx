import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/30 p-4">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-rose-100 p-4 rounded-full">
            <ExclamationTriangleIcon className="w-12 h-12 text-rose-600" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mt-2">Page Not Found</h2>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-4 inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;