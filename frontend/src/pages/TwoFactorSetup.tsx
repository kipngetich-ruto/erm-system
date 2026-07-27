import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClipboardIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react'; // ✅ Named import

const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'loading' | 'setup' | 'verified'>('loading');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Simulate fetching secret from backend
  useEffect(() => {
    const generateSecret = async () => {
      try {
        // Mock – replace with actual API call
        const mockSecret = 'JBSWY3DPEHPK3PXP';
        const mockUrl = 'otpauth://totp/EMR_System:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=EMR_System';
        setSecret(mockSecret);
        setOtpauthUrl(mockUrl);
        setStep('setup');
      } catch {
        setError('Failed to generate 2FA secret.');
        setStep('setup');
      }
    };
    generateSecret();
  }, []);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      // Mock verification – replace with actual API
      const success = verificationCode === '123456';
      if (success) {
        setStep('verified');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Invalid 2FA code. Please try again.');
      }
    } catch {
      setError('Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/30">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Generating secure 2FA credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-100/30 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg shadow-blue-500/25">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Two-Factor Authentication
              </h1>
              <p className="text-sm text-gray-500">Secure your account with 2FA</p>
            </div>
          </div>

          {step === 'verified' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">2FA Enabled!</h2>
              <p className="text-gray-500 mt-2">Your account is now protected.</p>
              <p className="text-sm text-gray-400 mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-700">1. Scan with Authenticator App</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Use Google Authenticator, Authy, or any TOTP app to scan this QR code.
                </p>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-200/50">
                    <QRCodeSVG value={otpauthUrl} size={180} level="H" includeMargin />
                  </div>
                </div>
              </div>

              {/* Secret */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <KeyIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-700">2. Or Enter Secret Manually</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50/80 border border-gray-200/80 rounded-xl px-4 py-3 font-mono text-sm text-gray-800 select-all tracking-wider">
                    {secret}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 text-gray-600 hover:bg-gray-100 transition shadow-sm flex-shrink-0"
                  >
                    {copied ? <CheckIcon className="w-5 h-5 text-emerald-600" /> : <ClipboardIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Verify */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-700">3. Verify Setup</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the 6-digit code from your authenticator app.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(val);
                      setError('');
                    }}
                    className="flex-1 px-4 py-3 text-center text-2xl tracking-[0.5em] bg-gray-50/80 border border-gray-200/80 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100/50 flex justify-between items-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Skip for now
                </button>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  TOTP • RFC 6238
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;