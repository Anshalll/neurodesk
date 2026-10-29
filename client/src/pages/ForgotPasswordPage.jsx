import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, loading, error, clearError } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    clearError();
    setStatusMessage('');
    try {
      const data = await forgotPassword(email);
      setStatusMessage(data.message || 'Verification code sent to your email.');
      setStep(2);
      setResendCooldown(60);
    } catch {
      // Error handled by AuthContext
    }
  };

  // Handle Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    clearError();
    try {
      const data = await forgotPassword(email);
      setStatusMessage(data.message || 'A new verification code was sent.');
      setResendCooldown(60);
    } catch {
      // Error handled by AuthContext
    }
  };

  // Handle Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    setStatusMessage('');

    if (newPassword !== confirmPassword) {
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      setStep(3);
    } catch {
      // Error handled by AuthContext
    }
  };

  const strength = (() => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6) return 'weak';
    if (newPassword.length < 10) return 'fair';
    return 'strong';
  })();

  const strengthStyles = {
    weak: { bars: 1, color: '#ef4444', label: 'Weak' },
    fair: { bars: 2, color: '#f59e0b', label: 'Fair' },
    strong: { bars: 3, color: '#22c55e', label: 'Strong' },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0e0e11] relative overflow-hidden py-10">
      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <KeyRound className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {step === 1 && 'Reset your password'}
            {step === 2 && 'Enter verification code'}
            {step === 3 && 'Password updated!'}
          </h1>
          <p className="text-sm text-[#a1a1aa] mt-1 text-center">
            {step === 1 && "We'll send a 6-digit verification code to your email."}
            {step === 2 && `Enter the code sent to ${email}`}
            {step === 3 && 'Your password has been reset successfully.'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-[#141416]/90 backdrop-blur-sm p-6 shadow-2xl space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Status Banner */}
          {statusMessage && !error && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* ── STEP 1: Request Email ────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 text-white text-sm placeholder-[#71717a] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>

              <div className="pt-2 text-center border-t border-[#27272a]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: Enter Code & New Password ──────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#a1a1aa]">
                    6-digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      clearError();
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Change email
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[8px] font-mono text-lg font-bold py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 text-white outline-none transition-all"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 text-white text-sm placeholder-[#71717a] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter */}
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              bar <= (strengthStyles[strength]?.bars || 0)
                                ? strengthStyles[strength].color
                                : '#27272a',
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: strengthStyles[strength].color }}
                    >
                      {strengthStyles[strength].label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border text-white text-sm placeholder-[#71717a] outline-none transition-all ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                      : 'border-[#27272a] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                  }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-rose-400 mt-1">Passwords do not match.</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length < 6 || !newPassword || newPassword !== confirmPassword}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Resend Code Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#27272a] text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>

                <Link
                  to="/login"
                  className="text-[#71717a] hover:text-white transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}

          {/* ── STEP 3: Success Confirmation ───────────────────────────────── */}
          {step === 3 && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-[#a1a1aa]">
                Your password has been successfully updated. You can now log into your account using your new credentials.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                Proceed to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
