import React from 'react';
import { LayoutDashboard, Users, Plus, ShieldCheck, Settings, FileSpreadsheet, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'customers' | 'users' | 'export' | 'settings' | 'audit';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewCustomer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewCustomer,
}) => {
  const { isSuperAdmin, isAdmin } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel border-t border-[#D4AF37]/20 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] mt-1">Dashboard</span>
        </button>

        {/* Customers */}
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] mt-1">Customers</span>
        </button>

        {/* Prominent Gold + Button in Center */}
        <button
          onClick={onOpenNewCustomer}
          className="flex h-12 w-12 items-center justify-center rounded-full gold-button-gradient -mt-5 shadow-lg shadow-[#D4AF37]/30 border-2 border-[#0d0d11] active:scale-90 transition-transform cursor-pointer"
          title="New Customer Entry"
        >
          <Plus className="h-6 w-6 text-black stroke-[2.5]" />
        </button>

        {/* Admin / Export / Audit */}
        {isSuperAdmin ? (
          <button
            onClick={() => setActiveTab('export')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span className="text-[10px] mt-1">Export</span>
          </button>
        ) : isAdmin ? (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[10px] mt-1">Staff</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-[10px] mt-1">Logs</span>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
};
