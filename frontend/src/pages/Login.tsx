import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { 
  ShieldCheckIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  KeyIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!requires2FA) {
        const res = await authApi.login(email, password);
        if (res.data.requires2FA) {
          setRequires2FA(true);
          setLoading(false);
          return;
        }
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        navigate('/dashboard');
      } else {
        const res = await authApi.verify2FA(email, totp);
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Invalid credentials or 2FA code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <HeartIcon className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
            Secure EMR Login
          </h2>
          <p className="text-center text-gray-500 text-sm mt-1 mb-6">
            Protecting patient data with 2FA
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {!requires2FA ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <KeyIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 font-medium">
                    Enter 6-digit code from your authenticator
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    2FA Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={totp}
                    onChange={(e) => setTotp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify 2FA'}
                </button>

                <button
                  type="button"
                  onClick={() => setRequires2FA(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline w-full text-center transition"
                >
                  ← Back to login
                </button>
              </>
            )}
          </form>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-5">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-green-500" /> AES-256-GCM
            </span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span>Argon2id</span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span>TLS 1.3</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 EMR System • Secure • Compliant
        </p>
      </div>
    </div>
  );
};

export default Login;