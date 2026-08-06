import React from 'react';
import { Sparkles, Search, Sun, Moon, LogOut, Shield, Clock, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSpaData } from '../context/SpaDataContext';

interface HeaderProps {
  onOpenNewCustomer: () => void;
  onOpenQuickSearch: () => void;
  onSelectRoleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewCustomer,
  onOpenQuickSearch,
  onSelectRoleModal,
}) => {
  const { user, logout, isSuperAdmin, isAdmin, inactivityWarning } = useAuth();
  const { settings, theme, toggleTheme } = useSpaData();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-[#D4AF37]/20 px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Logo & Spa Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E5C158] via-[#D4AF37] to-[#B8860B] text-black shadow-md shadow-[#D4AF37]/20">
            <Sparkles className="h-5 w-5 fill-black" />
          </div>
          <div>
            <h1 className="font-serif-luxury text-lg font-bold tracking-wide text-white dark:text-white light:text-gray-900 flex items-center gap-2">
              {settings.spaName}
              <span className="hidden sm:inline-block rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-sans font-semibold tracking-wider text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                CMS
              </span>
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 hidden sm:block">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Global Search Bar (Trigger) */}
        <button
          onClick={onOpenQuickSearch}
          className="hidden md:flex items-center gap-2 rounded-xl bg-white/5 light:bg-black/5 hover:bg-white/10 px-4 py-2 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 border border-white/10 light:border-black/10 transition-all cursor-pointer w-64"
        >
          <Search className="h-4 w-4 text-[#D4AF37]" />
          <span className="flex-1 text-left text-xs">Search name, mobile, invoice...</span>
          <kbd className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-gray-400 border border-white/10">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls & User Session */}
        <div className="flex items-center gap-2">
          {/* Quick Mobile Search Button */}
          <button
            onClick={onOpenQuickSearch}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 light:bg-black/5 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-white/10"
            title="Search"
          >
            <Search className="h-4 w-4 text-[#D4AF37]" />
          </button>

          {/* New Customer Entry CTA */}
          <button
            onClick={onOpenNewCustomer}
            className="hidden sm:flex items-center gap-1.5 rounded-xl gold-button-gradient px-3.5 py-2 text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 light:bg-black/5 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* User Profile / Role Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10 light:border-black/10">
              <button
                onClick={onSelectRoleModal}
                className="flex items-center gap-2 rounded-xl bg-white/5 light:bg-black/5 px-2.5 py-1.5 border border-white/10 hover:border-[#D4AF37]/40 transition-all text-left cursor-pointer"
                title="Switch Role / View User Profile"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-white dark:text-white light:text-gray-900 leading-none truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </p>
                  <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block mt-0.5">
                    {isSuperAdmin ? 'SUPER ADMIN' : user.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inactivity Warning Bar */}
      {inactivityWarning && (
        <div className="mt-2 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-center text-xs text-amber-200 flex items-center justify-center gap-2 animate-pulse">
          <Clock className="h-4 w-4 text-amber-400" />
          <span>Inactivity alert: You will be automatically logged out in 30 seconds due to idle time. Move your mouse or touch screen to stay logged in.</span>
        </div>
      )}
    </header>
  );
};
