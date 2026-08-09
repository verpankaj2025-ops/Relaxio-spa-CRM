import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, UserPlus, ShieldAlert, Trash2, KeyRound, RefreshCw, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, UserCheck, UserX, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

type ActionType = 'suspend' | 'activate' | 'delete' | 'reset_password';

interface ConfirmModalState {
  type: ActionType;
  user: User;
}

export const UserManagementView: React.FC = () => {
  const { user: currentUser, isSuperAdmin, isAdmin, canManageUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Alert message state
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [password, setPassword] = useState('Relaxio@123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async (showMainSpinner = true) => {
    if (showMainSpinner) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setAlertMessage({ type: 'error', text: err.message || 'Failed to load user accounts from database' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(true);

    // Set up Realtime Subscription for Users table
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime_user_management')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          loadUsers(false);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          loadUsers(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !canManageUsers) {
      setAlertMessage({ type: 'error', text: 'You do not have permission to provision user accounts' });
      return;
    }

    if (!name.trim() || !email.trim()) {
      setAlertMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setSubmitting(true);
    setAlertMessage(null);

    try {
      const newUser = await apiService.createUser(
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role,
          password: password.trim() || 'Relaxio@123',
        },
        currentUser
      );

      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('Relaxio@123');
      setRole('staff');

      setAlertMessage({
        type: 'success',
        text: `User account for "${newUser.name}" (${newUser.role.replace('_', ' ')}) provisioned successfully!`,
      });

      await loadUsers(false);
    } catch (err: any) {
      console.error('Create user failed:', err);
      setAlertMessage({ type: 'error', text: err.message || 'Error provisioning user account' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal || !currentUser) return;
    const { type, user } = confirmModal;

    setActionLoading(true);
    setAlertMessage(null);

    try {
      if (type === 'suspend') {
        await apiService.updateUserStatus(user.id, 'suspended', currentUser);
        setAlertMessage({ type: 'success', text: `Account for ${user.name} has been suspended.` });
      } else if (type === 'activate') {
        await apiService.updateUserStatus(user.id, 'active', currentUser);
        setAlertMessage({ type: 'success', text: `Account for ${user.name} has been activated.` });
      } else if (type === 'delete') {
        await apiService.deleteUser(user.id, currentUser);
        setAlertMessage({ type: 'success', text: `Account for ${user.name} has been deleted.` });
      } else if (type === 'reset_password') {
        const res = await apiService.sendPasswordResetEmail(user.email);
        setAlertMessage({ type: 'success', text: res.message || `Password reset link sent to ${user.email}` });
      }

      setConfirmModal(null);
      await loadUsers(false);
    } catch (err: any) {
      console.error('Action error:', err);
      setAlertMessage({ type: 'error', text: err.message || `Failed to perform ${type.replace('_', ' ')}` });
    } finally {
      setActionLoading(false);
    }
  };

  // RBAC Permission Check: Staff members cannot access user management
  if (!canManageUsers) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl border border-red-500/30 max-w-md mx-auto my-12 space-y-3">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto animate-bounce" />
        <h2 className="font-serif-luxury text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-gray-400">
          Only Super Admin and Admin accounts have permission to access the User Control Panel.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Never';
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
            <span>User Accounts & Role Permissions</span>
            {refreshing && <RefreshCw className="h-4 w-4 text-[#D4AF37] animate-spin ml-2" />}
          </h2>
          <p className="text-xs text-gray-400">
            Live Supabase integration — Provision staff, manage credentials, suspend accounts, and send password reset emails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadUsers(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-colors cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={() => {
              setRole(isSuperAdmin ? 'admin' : 'staff');
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs border ${
            alertMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-gray-400 hover:text-white cursor-pointer ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, phone, or role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
        <div className="text-xs text-gray-400 font-semibold">
          Total Users: <span className="text-[#D4AF37]">{users.length}</span>
        </div>
      </div>

      {/* Users List Table */}
      <div className="rounded-3xl glass-panel border border-[#D4AF37]/20 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
            <p className="text-xs">Fetching user records from Supabase database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-black/60 border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      {searchQuery
                        ? 'No users match your search query.'
                        : 'No staff user accounts found in database. Click "Provision New User" to create one.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isTargetSuperAdmin = u.role === 'super_admin' || u.email?.toLowerCase().trim() === 'verpankaj2025@gmail.com';
                    const isPrimarySuperAdmin = u.email?.toLowerCase().trim() === 'verpankaj2025@gmail.com';

                    // RBAC Rule: Admins cannot manage Super Admins
                    const canManageTarget = isSuperAdmin
                      ? !isPrimarySuperAdmin // Super Admin can manage anyone except primary Super Admin
                      : !isTargetSuperAdmin; // Admin can manage staff/admin, but NOT Super Admin

                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          {isPrimarySuperAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                              Primary
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-gray-300 font-medium">{u.email}</p>
                          <p className="text-[11px] text-gray-400">{u.phone || 'No Phone'}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              isTargetSuperAdmin
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                                : u.role === 'admin'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                              u.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                              }`}
                            />
                            <span className="capitalize">{u.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-[11px]">{formatDate(u.createdAt)}</td>
                        <td className="p-4 text-gray-400 text-[11px]">{formatDate(u.lastLogin)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canManageTarget ? (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      type: u.status === 'active' ? 'suspend' : 'activate',
                                      user: u,
                                    })
                                  }
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-colors ${
                                    u.status === 'active'
                                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                                  }`}
                                  title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                                >
                                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>

                                <button
                                  onClick={() => setConfirmModal({ type: 'reset_password', user: u })}
                                  className="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 cursor-pointer"
                                  title="Send Password Reset Email"
                                >
                                  <KeyRound className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => setConfirmModal({ type: 'delete', user: u })}
                                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic px-2 py-1">Protected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Matrix Helper */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="font-serif-luxury text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
          <span>Role & Access Permissions Matrix</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-[#D4AF37]/30 space-y-2">
            <p className="font-bold text-[#D4AF37] uppercase flex items-center justify-between">
              <span>Super Admin</span>
              <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full">Full Control</span>
            </p>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Full system configuration & database controls</li>
              <li>Provision & manage Admins & Staff</li>
              <li>Execute system backups & data exports</li>
              <li>System audit log inspection</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/30 space-y-2">
            <p className="font-bold text-blue-400 uppercase flex items-center justify-between">
              <span>Admin</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Manager Access</span>
            </p>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Provision & manage Staff accounts</li>
              <li>Manage customers, therapists, rooms, services</li>
              <li>View operational & revenue reports</li>
              <li>Cannot modify or delete Super Admin</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
            <p className="font-bold text-emerald-400 uppercase flex items-center justify-between">
              <span>Staff / Desk</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Front Desk</span>
            </p>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Check in guests & print invoices</li>
              <li>Update session completion status</li>
              <li>Search guest appointment history</li>
              <li>No user management or data export access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Provision New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-[#D4AF37]/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#D4AF37]" />
                <span>Provision New User Account</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Anish Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address (Supabase Login) *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. anish@relaxiospa.com"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 9811223344"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  {isSuperAdmin && <option value="admin" className="bg-gray-900">Admin</option>}
                  <option value="staff" className="bg-gray-900">Staff / Desk User</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Initial Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set initial login password"
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  User can log in with this email and password immediately or request a reset.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl gold-button-gradient text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <span>Provision Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-[#D4AF37]/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              {confirmModal.type === 'delete' ? (
                <Trash2 className="h-6 w-6 text-red-400" />
              ) : confirmModal.type === 'reset_password' ? (
                <KeyRound className="h-6 w-6 text-blue-400" />
              ) : confirmModal.type === 'suspend' ? (
                <UserX className="h-6 w-6 text-amber-400" />
              ) : (
                <UserCheck className="h-6 w-6 text-emerald-400" />
              )}
              <h3 className="font-serif-luxury text-base font-bold text-white capitalize">
                Confirm {confirmModal.type.replace('_', ' ')}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {confirmModal.type === 'delete' && (
                <>
                  Are you sure you want to permanently delete the user account for{' '}
                  <strong className="text-white">{confirmModal.user.name}</strong> ({confirmModal.user.email})? This action
                  will remove their record from Supabase database.
                </>
              )}
              {confirmModal.type === 'suspend' && (
                <>
                  Are you sure you want to suspend access for{' '}
                  <strong className="text-white">{confirmModal.user.name}</strong> ({confirmModal.user.email})? They will be
                  blocked from signing in.
                </>
              )}
              {confirmModal.type === 'activate' && (
                <>
                  Re-activate access for <strong className="text-white">{confirmModal.user.name}</strong> (
                  {confirmModal.user.email})?
                </>
              )}
              {confirmModal.type === 'reset_password' && (
                <>
                  Send a password reset link to <strong className="text-white">{confirmModal.user.email}</strong>? They will
                  receive an email with instructions to set a new password.
                </>
              )}
            </p>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : confirmModal.type === 'reset_password'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'gold-button-gradient text-black'
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

