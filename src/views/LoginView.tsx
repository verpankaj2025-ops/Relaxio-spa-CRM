import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const LoginView: React.FC = () => {
  const { login, resetPassword, loading } = useAuth();

  // Super Admin & Auth status state
  const [systemStatus, setSystemStatus] = useState<'READY' | 'UNINITIALIZED' | 'AUTH_MISSING' | null>(null);
  const [checkingSuperAdmin, setCheckingSuperAdmin] = useState<boolean>(true);

  // Sign In state (empty fields by default)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize Super Admin state
  const [initName, setInitName] = useState('');
  const [initEmail, setInitEmail] = useState('');
  const [initPassword, setInitPassword] = useState('');
  const [initConfirmPassword, setInitConfirmPassword] = useState('');
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState('');

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await apiService.checkSystemAuthStatus();
        if (isMounted) setSystemStatus(res.status);
      } catch {
        if (isMounted) setSystemStatus('READY');
      } finally {
        if (isMounted) setCheckingSuperAdmin(false);
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await login(identifier, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid login credentials');
    }
  };

  const handleInitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitError('');
    setSuccessMessage('');

    if (!initName.trim() || !initEmail.trim() || !initPassword) {
      setInitError('Please fill in all required fields.');
      return;
    }

    if (initPassword !== initConfirmPassword) {
      setInitError('Passwords do not match.');
      return;
    }

    if (initPassword.length < 6) {
      setInitError('Password must be at least 6 characters long.');
      return;
    }

    setInitLoading(true);

    try {
      const res = await apiService.initializeSuperAdmin({
        name: initName,
        email: initEmail,
        password: initPassword,
      });

      // Set success feedback
      setSuccessMessage(res.message || 'Super Admin account initialized successfully. Please sign in.');
      
      // Permanently mark Super Admin as existing and ready
      setSystemStatus('READY');

      // Pre-fill email field for convenience and reset password inputs
      setIdentifier(initEmail);
      setPassword('');
      setInitName('');
      setInitEmail('');
      setInitPassword('');
      setInitConfirmPassword('');
    } catch (err: any) {
      setInitError(err.message || 'Failed to initialize Super Admin account.');
    } finally {
      setInitLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    try {
      await resetPassword(forgotEmail);
      alert('Password reset instructions sent to ' + forgotEmail);
      setIsForgotModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to send password reset request.');
    } finally {
      setForgotSent(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0B] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#19191D] via-[#0A0A0B] to-[#0A0A0B]">
      <div className="w-full max-w-md space-y-6">
        {/* Spa Branding Card */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#E5C158] via-[#C5A059] to-[#9A7B3E] text-black shadow-xl shadow-[#C5A059]/20 border border-[#C5A059]/40">
            <Sparkles className="h-8 w-8 fill-black" />
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold tracking-wide text-white">
            Relaxio Spa
          </h1>
          <p className="text-xs text-[#C5A059] uppercase tracking-widest font-semibold">
            Customer Management System
          </p>
        </div>

        {/* Loading State */}
        {checkingSuperAdmin ? (
          <div className="p-8 rounded-3xl glass-panel border border-[#C5A059]/30 shadow-2xl text-center space-y-4">
            <RefreshCw className="h-8 w-8 text-[#C5A059] animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Verifying system initialization status...</p>
          </div>
        ) : systemStatus === 'AUTH_MISSING' ? (
          /* AUTHENTICATION USER MISSING WARNING VIEW */
          <div className="p-8 rounded-3xl glass-panel border border-amber-500/40 shadow-2xl space-y-5 text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                Account Status Alert
              </h2>
              <p className="text-xs text-amber-200/90 leading-relaxed font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                Authentication account is missing.
                <br />
                Please contact the system administrator.
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              The user profile exists in the database, but no corresponding Supabase Auth credentials were found. Auto-creation is disabled.
            </p>
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSystemStatus('READY')}
                className="text-[11px] text-[#C5A059] hover:underline font-semibold cursor-pointer"
              >
                Go to Standard Sign In &rarr;
              </button>
            </div>
          </div>
        ) : systemStatus === 'UNINITIALIZED' ? (
          /* ONE-TIME INITIALIZE SUPER ADMIN SCREEN */
          <div className="p-8 rounded-3xl glass-panel border border-[#C5A059]/40 shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-3 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-bold uppercase tracking-wider mb-2">
                <UserPlus className="h-3.5 w-3.5" /> Initial System Setup
              </div>
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                Initialize Super Admin
              </h2>
              <p className="text-[11px] text-gray-400 mt-1">
                Zero Super Admin accounts detected. Set up the master system administrator account below.
              </p>
            </div>

            {initError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 text-center flex flex-col items-center justify-center gap-1.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{initError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemStatus('READY')}
                  className="text-[11px] text-[#C5A059] hover:underline font-semibold cursor-pointer mt-1"
                >
                  Switch to Standard Login Screen &rarr;
                </button>
              </div>
            )}

            <form onSubmit={handleInitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={initName}
                  onChange={e => setInitName(e.target.value)}
                  placeholder="e.g. Pankaj Verma"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#C5A059]" />
                  <input
                    type="email"
                    value={initEmail}
                    onChange={e => setInitEmail(e.target.value)}
                    placeholder="verpankaj2025@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#C5A059]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={initPassword}
                    onChange={e => setInitPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={initConfirmPassword}
                  onChange={e => setInitConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={initLoading}
                className="w-full py-3 rounded-xl gold-button-gradient font-bold text-xs shadow-lg shadow-[#C5A059]/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{initLoading ? 'Creating Account...' : 'Create Super Admin Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setSystemStatus('READY')}
                  className="text-[11px] text-[#C5A059] hover:underline cursor-pointer"
                >
                  Already initialized or registered? Go to Sign In
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STANDARD LOGIN SCREEN */
          <div className="p-8 rounded-3xl glass-panel border border-[#C5A059]/30 shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h2 className="font-serif-luxury text-base font-bold text-white text-center">
                Staff & Executive Sign In
              </h2>
              <p className="text-[11px] text-gray-400 text-center mt-0.5">
                Enter your mobile number or email address
              </p>
            </div>

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 text-center flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* Identifier (Empty by default) */}
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Mobile Number or Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#C5A059]" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter email address or mobile"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password (Empty by default) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-gray-300">Password *</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-[#C5A059] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#C5A059]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gold-button-gradient font-bold text-xs shadow-lg shadow-[#C5A059]/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In To Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Security Footer */}
        <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
          <span>Encrypted Session • Auto Logout Inactivity Protection</span>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel border border-[#D4AF37]/30 p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif-luxury text-base font-bold text-white text-center">
              Password Recovery
            </h3>
            <p className="text-xs text-gray-400 text-center">
              Enter your registered email address to receive password reset instructions.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="registered@email.com"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="px-4 py-2 rounded-xl gold-button-gradient font-bold cursor-pointer"
                >
                  {forgotSent ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
