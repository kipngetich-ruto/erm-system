import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totpError, setTotpError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Clear errors ONLY when user types – never on submit
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };
  const handleTotpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotp(e.target.value);
    if (totpError) setTotpError(null);
  };

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!requires2FA) {
        const res = await authApi.login(email, password);
        const data = res.data;

        if (data.requires2FA) {
          setRequires2FA(true);
          setLoading(false);
          return;
        }

        const { user, accessToken, refreshToken } = data;
        setAuth(user, accessToken, refreshToken);
        navigate('/dashboard');
      } else {
        const res = await authApi.verify2FA(email, totp);
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      if (requires2FA) {
        setTotpError(message);
      } else {
        setError(message);
      }
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
                      onChange={handleEmailChange}
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
                      onChange={handlePasswordChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Error message – stays visible until user types */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

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
                    onChange={handleTotpChange}
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* 2FA error message – stays visible until user types */}
                {totpError && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{totpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify 2FA'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTotp('');
                    setTotpError(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline w-full text-center transition"
                >
                  ← Back to login
                </button>
              </>
            )}
          </form>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-500">Don't have an account?</span>
            <Link to="/register" className="ml-2 text-blue-600 hover:text-blue-800 font-medium transition">
              Register
            </Link>
          </div>

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