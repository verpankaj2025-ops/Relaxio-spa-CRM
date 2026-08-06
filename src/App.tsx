import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SpaDataProvider } from './context/SpaDataContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { CustomerFormModal } from './components/CustomerFormModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { SupabaseMissingError } from './components/SupabaseMissingError';
import { isSupabaseConfigured, isDevMode } from './supabaseClient';
import { Customer } from './types';
import { Shield, LogOut, UserCheck, X } from 'lucide-react';

// Dynamic Lazy Imports for Production Bundle Optimization
const DashboardView = React.lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const CustomerListView = React.lazy(() => import('./views/CustomerListView').then(m => ({ default: m.CustomerListView })));
const UserManagementView = React.lazy(() => import('./views/UserManagementView').then(m => ({ default: m.UserManagementView })));
const DataExportView = React.lazy(() => import('./views/DataExportView').then(m => ({ default: m.DataExportView })));
const AuditLogsView = React.lazy(() => import('./views/AuditLogsView').then(m => ({ default: m.AuditLogsView })));
const SettingsView = React.lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const LoginView = React.lazy(() => import('./views/LoginView').then(m => ({ default: m.LoginView })));

const ViewLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Loading View...</span>
    </div>
  </div>
);

const SpaAppContent: React.FC = () => {
  const { user, loginAsRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal States
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  if (!isSupabaseConfigured && !isDevMode) {
    return <SupabaseMissingError />;
  }

  if (!user) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <LoginView />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] selection:bg-[#C5A059]/30 selection:text-white flex flex-col">
      {/* Top Header */}
      <Header
        onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onSelectRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-0">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Suspense fallback={<ViewLoader />}>
            {activeTab === 'dashboard' && (
              <DashboardView onOpenNewCustomer={() => setIsNewCustomerOpen(true)} />
            )}

            {activeTab === 'customers' && (
              <CustomerListView
                onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
                onEditCustomer={c => setEditingCustomer(c)}
                onViewProfile={c => setViewingCustomer(c)}
                onPrintInvoice={c => setInvoiceCustomer(c)}
              />
            )}

            {activeTab === 'users' && <UserManagementView />}

            {activeTab === 'export' && <DataExportView />}

            {activeTab === 'audit' && <AuditLogsView />}

            {activeTab === 'settings' && <SettingsView />}
          </Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
      />

      {/* MODALS */}
      {/* Check In / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isNewCustomerOpen || !!editingCustomer}
        onClose={() => {
          setIsNewCustomerOpen(false);
          setEditingCustomer(null);
        }}
        initialCustomer={editingCustomer}
      />

      {/* Customer Full Profile Modal */}
      <CustomerProfileModal
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        onEdit={c => setEditingCustomer(c)}
        onPrintInvoice={c => setInvoiceCustomer(c)}
      />

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectCustomer={c => setViewingCustomer(c)}
      />

      {/* Printable Invoice Modal */}
      <InvoicePrintModal
        customer={invoiceCustomer}
        onClose={() => setInvoiceCustomer(null)}
      />

      {/* Role Switcher & User Session Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-panel border border-[#C5A059]/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#C5A059]" />
                <h3 className="font-serif-luxury text-base font-bold text-white">Active User Profile</h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <p className="font-bold text-white text-sm">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded-full border border-[#C5A059]/30">
                  {user.role.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active Session</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Switch Persona Demo</p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    loginAsRole('super_admin');
                    setIsRoleModalOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                    user.role === 'super_admin'
                      ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>Super Admin</span>
                  {user.role === 'super_admin' && <UserCheck className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    loginAsRole('admin');
                    setIsRoleModalOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                    user.role === 'admin'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>Admin</span>
                  {user.role === 'admin' && <UserCheck className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    loginAsRole('staff');
                    setIsRoleModalOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                    user.role === 'staff'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>Staff Desk</span>
                  {user.role === 'staff' && <UserCheck className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setIsRoleModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Of System</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SpaDataProvider>
        <SpaAppContent />
      </SpaDataProvider>
    </AuthProvider>
  );
}
