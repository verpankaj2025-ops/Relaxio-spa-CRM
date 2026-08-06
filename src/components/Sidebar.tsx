import React from 'react';
import { LayoutDashboard, Users, Plus, ShieldCheck, FileSpreadsheet, History, Settings, DatabaseBackup } from 'lucide-react';
import { ActiveTab } from './BottomNav';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewCustomer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewCustomer,
}) => {
  const { isSuperAdmin, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers' as ActiveTab, label: 'Customer Management', icon: Users },
  ];

  if (isSuperAdmin) {
    navItems.push({ id: 'users' as ActiveTab, label: 'Admin Control Panel', icon: ShieldCheck });
    navItems.push({ id: 'export' as ActiveTab, label: 'Download Data Suite', icon: FileSpreadsheet });
  } else if (isAdmin) {
    navItems.push({ id: 'users' as ActiveTab, label: 'Staff Management', icon: ShieldCheck });
  }

  navItems.push({ id: 'audit' as ActiveTab, label: 'Security & Audit Logs', icon: History });
  navItems.push({ id: 'settings' as ActiveTab, label: 'Settings & Backups', icon: Settings });

  return (
    <aside className="hidden md:flex w-64 flex-col glass-panel border-r border-[#D4AF37]/20 p-4 space-y-6 min-h-[calc(100vh-65px)]">
      {/* Primary Action CTA */}
      <button
        onClick={onOpenNewCustomer}
        className="w-full flex items-center justify-center gap-2 rounded-xl gold-button-gradient py-3 px-4 text-sm font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>New Customer Entry</span>
      </button>

      {/* Navigation Links */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Security Status Box */}
      <div className="mt-auto p-3.5 rounded-2xl bg-black/40 light:bg-gray-100 border border-[#D4AF37]/20 text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Encrypted Session</span>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-400">
          Role-Based Access Control active. Auto-log out after 5m inactivity.
        </p>
      </div>
    </aside>
  );
};
