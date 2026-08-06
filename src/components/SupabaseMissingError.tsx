import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Key, Database } from 'lucide-react';

export const SupabaseMissingError: React.FC = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4 sm:p-6 selection:bg-[#C5A059]/30">
      <div className="w-full max-w-xl rounded-3xl glass-panel border border-red-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
              Production Configuration Error
            </span>
            <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white mt-1">
              Supabase environment variables are missing.
            </h1>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            This application is deployed in production and requires active Supabase authentication and database connection to function securely.
          </p>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#C5A059] font-semibold">
              <Key className="h-4 w-4" />
              <span>Required Environment Credentials:</span>
            </div>
            <ul className="space-y-2 font-mono text-gray-400 pl-1">
              <li className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span>VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL</span>
                <span className="text-red-400 font-bold text-[10px] uppercase">Missing</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span>VITE_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span className="text-red-400 font-bold text-[10px] uppercase">Missing</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span>All CRUD Operations Disabled</span>
            </div>
            <p>
              LocalStorage persistence is disabled in production. Local data saving is unavailable until Supabase credentials are configured.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Database className="h-4 w-4 text-[#C5A059]" />
            <span>Set environment variables and retry</span>
          </div>

          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B38F48] hover:to-[#C5A059] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking Connection...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
