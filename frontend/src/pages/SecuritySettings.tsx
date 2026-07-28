import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/endpoints';
import {
  ShieldCheckIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { user, setAuth, accessToken } = useAuthStore();

  // ---- Password state ----
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // ---- 2FA state ----
  const [totp, setTotp] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');

  // ---- Password change handler ----
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.data.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ---- 2FA disable handler ----
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totp.length !== 6) {
      setTwoFAError('Please enter a valid 6-digit code.');
      return;
    }
    setIsDisabling(true);
    setTwoFAError('');
    setTwoFASuccess('');

    try {
      const res = await authApi.disable2FA(user!.email, totp);
      if (res.data.success) {
        setTwoFASuccess('2FA disabled successfully.');
        const updatedUser = { ...user!, isTwoFactorEnabled: false };
        setAuth(updatedUser, accessToken!, localStorage.getItem('refreshToken')!);
        setTotp('');
      }
    } catch (err: any) {
      setTwoFAError(err.response?.data?.message || 'Failed to disable 2FA.');
    } finally {
      setIsDisabling(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          Security Settings
        </h1>
        <p className="text-gray-500 text-sm">Manage your password and two-factor authentication.</p>
      </div>

      <div className="space-y-6">
        {/* ---- Change Password Card ---- */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-gray-200/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <LockClosedIcon className="w-5 h-5 text-blue-600" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password (min 8 chars)"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Re-enter new password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">
                {passwordSuccess}
              </div>
            )}
          </form>
        </div>

        {/* ---- 2FA Management Card ---- */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between border-b border-gray-100/50 pb-4">
            <div className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication</h3>
            </div>
            <div className="flex items-center gap-2">
              {user.isTwoFactorEnabled ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Enabled</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-rose-600" />
                  <span className="text-rose-700 font-medium">Disabled</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            {user.isTwoFactorEnabled ? (
              // ----- Disable 2FA form -----
              <form onSubmit={handleDisable2FA}>
                <p className="text-sm text-gray-500 mb-3">
                  To disable 2FA, enter the current 6-digit code from your authenticator app.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="000000"
                    value={totp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setTotp(val);
                      setTwoFAError('');
                    }}
                    className="flex-1 px-4 py-3 text-center text-2xl tracking-[0.5em] bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isDisabling || totp.length !== 6}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDisabling ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      'Disable 2FA'
                    )}
                  </button>
                </div>
                {twoFAError && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                    {twoFAError}
                  </div>
                )}
                {twoFASuccess && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">
                    {twoFASuccess}
                  </div>
                )}
              </form>
            ) : (
              // ----- Enable 2FA button -----
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">
                  2FA is currently disabled. Enable it to add an extra layer of security.
                </p>
                <button
                  onClick={() => navigate('/setup-2fa')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200"
                >
                  Enable 2FA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;