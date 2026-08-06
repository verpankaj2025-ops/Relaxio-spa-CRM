import React, { useState } from 'react';
import { Sparkles, Phone, Mail, Lock, KeyRound, ShieldCheck, UserCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { login, resetPassword, loginAsRole, loading } = useAuth();

  const [identifier, setIdentifier] = useState('verpankaj2025@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login(identifier, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid mobile number/email or password');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    try {
      await resetPassword(forgotEmail);
      alert('Password reset link sent to ' + forgotEmail);
      setIsForgotModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to send password reset email');
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

        {/* Login Form Panel */}
        <div className="p-8 rounded-3xl glass-panel border border-[#C5A059]/30 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="font-serif-luxury text-base font-bold text-white text-center">
              Staff & Executive Sign In
            </h2>
            <p className="text-[11px] text-gray-400 text-center mt-0.5">
              Enter your mobile number or email address
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Identifier */}
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
                  placeholder="9876543210 or owner@relaxiospa.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0B]/60 border border-white/10 text-white focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
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

          {/* Quick Demo Login Swapper */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-[11px] font-semibold text-center text-gray-400">
              ⚡ Quick Demo Login (Select Role)
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => loginAsRole('super_admin')}
                className="p-2 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] font-bold hover:bg-[#C5A059]/25 transition-all cursor-pointer text-center"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => loginAsRole('admin')}
                className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold hover:bg-blue-500/25 transition-all cursor-pointer text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => loginAsRole('staff')}
                className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/25 transition-all cursor-pointer text-center"
              >
                Staff Desk
              </button>
            </div>
          </div>
        </div>

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
              Enter your registered mobile number or email address. Super Admin will receive the reset request.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Mobile number or Email"
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
                  {forgotSent ? 'Sending Reset...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
