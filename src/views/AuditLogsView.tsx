import React, { useState } from 'react';
import { History, Shield, Search, Lock, Clock, User, Eye } from 'lucide-react';
import { useSpaData } from '../context/SpaDataContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useSpaData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
          <History className="h-6 w-6 text-[#D4AF37]" />
          <span>Security Audit & Activity Logs</span>
        </h2>
        <p className="text-xs text-gray-400">
          Immutable audit trail logging every check-in, edit, deletion, login, and data download.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl glass-panel border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#D4AF37]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search log user, action, details..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black focus:border-[#D4AF37] focus:outline-none"
        >
          <option value="all" className="bg-gray-900">All Audit Actions</option>
          <option value="CREATE_CUSTOMER" className="bg-gray-900">Create Customer</option>
          <option value="UPDATE_CUSTOMER" className="bg-gray-900">Update Customer</option>
          <option value="DELETE_CUSTOMER" className="bg-gray-900">Delete Customer</option>
          <option value="LOGIN" className="bg-gray-900">User Login</option>
          <option value="EXPORT_DATA" className="bg-gray-900">Data Export</option>
          <option value="CREATE_USER" className="bg-gray-900">User Provisioning</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl glass-panel border border-[#D4AF37]/20 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/60 border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User & Role</th>
              <th className="p-4">Action</th>
              <th className="p-4">Target Entity</th>
              <th className="p-4">Audit Log Details</th>
              <th className="p-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No security audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white">{log.userName}</p>
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37]">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        log.action.includes('CREATE')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.action.includes('DELETE')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : log.action.includes('LOGIN')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-gray-400 uppercase">
                    {log.targetEntity}
                  </td>
                  <td className="p-4 text-gray-200 font-medium">
                    {log.details}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-gray-500">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
