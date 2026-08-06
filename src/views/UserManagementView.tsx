import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, UserX, Lock, KeyRound, Check, X, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { User, UserRole } from '../types';

export const UserManagementView: React.FC = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // New User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('admin');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isSuperAdmin) {
      alert('Only Super Admin can create user accounts');
      return;
    }

    try {
      await apiService.createUser({ name, email, phone, role }, currentUser);
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error creating user account');
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!currentUser || !isSuperAdmin) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await apiService.updateUserStatus(user.id, newStatus, currentUser);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!currentUser || !isSuperAdmin) return;
    if (user.role === 'super_admin') {
      alert('Super Admin accounts cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete user account ${user.name}?`)) {
      try {
        await apiService.deleteUser(user.id, currentUser);
        await loadUsers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl border border-red-500/30 max-w-md mx-auto my-12 space-y-3">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="font-serif-luxury text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-gray-400">
          Only Super Admin accounts have permission to access the User & Role Control Panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
            <span>Super Admin Control & Staff Roles</span>
          </h2>
          <p className="text-xs text-gray-400">
            Provision Admins, Staff, suspend accounts, and manage permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Users List */}
      <div className="rounded-3xl glass-panel border border-[#D4AF37]/20 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/60 border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="p-4">User Name</th>
              <th className="p-4">Contact Details</th>
              <th className="p-4">Role</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Last Login</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No staff user accounts found in database. Click "Provision New User" to create one.
                </td>
              </tr>
            ) : (
              users.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white">{u.name}</td>
                <td className="p-4">
                  <p className="text-gray-300">{u.email}</p>
                  <p className="text-[11px] text-gray-400">{u.phone}</p>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'super_admin'
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
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-[11px]">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.role !== 'super_admin' && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer ${
                            u.status === 'active' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Role Matrix Helper */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="font-serif-luxury text-sm font-bold text-white">Role Permission Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-[#D4AF37]/30 space-y-2">
            <p className="font-bold text-[#D4AF37] uppercase">Super Admin</p>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Full system access & setup</li>
              <li>Create/delete Admins & Staff</li>
              <li>Download raw Excel/CSV/PDF exports</li>
              <li>Restore & clear database backups</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/30 space-y-2">
            <p className="font-bold text-blue-400 uppercase">Admin</p>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Customer check-in & record edit</li>
              <li>Manage therapists, rooms, services</li>
              <li>View operational dashboard stats</li>
              <li>Cannot delete Super Admin or download exports</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
            <p className="font-bold text-emerald-400 uppercase">Staff / Desk</p>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Check in guests & generate invoice</li>
              <li>Mark session status Completed</li>
              <li>Search duplicate mobile history</li>
              <li>No user management or data export access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-[#D4AF37]/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif-luxury text-base font-bold text-white">Provision New Staff Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
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
                  placeholder="e.g. Rahul Mehra"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. rahul@relaxiospa.com"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
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
                  className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
                >
                  <option value="admin" className="bg-gray-900">Admin</option>
                  <option value="staff" className="bg-gray-900">Staff</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gold-button-gradient text-xs font-bold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
