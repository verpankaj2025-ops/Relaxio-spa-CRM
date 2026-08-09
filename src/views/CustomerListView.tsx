import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Calendar, Plus, User, Phone, Printer, Edit, Trash2, Eye, ArrowUpDown, Clock, CheckCircle2, Ban, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useSpaData } from '../context/SpaDataContext';
import { useAuth } from '../context/AuthContext';
import { Customer, CustomerStatus, CustomerType } from '../types';

interface CustomerListViewProps {
  onOpenNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onViewProfile: (customer: Customer) => void;
  onPrintInvoice: (customer: Customer) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  onOpenNewCustomer,
  onEditCustomer,
  onViewProfile,
  onPrintInvoice,
}) => {
  const { customers, therapists, deleteCustomer, updateCustomer, settings, loading, error, refreshData } = useSpaData();
  const { canDeleteCustomer, isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [therapistFilter, setTherapistFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const itemsPerPage = 8;

  // Filter Logic memoized
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Exclude deleted customers
      if (c.status === 'Deleted') return false;

      // Search Term
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.mobile.includes(term) ||
        c.invoiceNumber.toLowerCase().includes(term) ||
        c.therapistName.toLowerCase().includes(term) ||
        (c.agentName && c.agentName.toLowerCase().includes(term)) ||
        c.roomNumber.toLowerCase().includes(term) ||
        c.paymentMethod.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // Date Filter
      const todayStr = new Date().toISOString().split('T')[0];
      if (dateFilter === 'today' && c.visitDate !== todayStr) return false;

      if (dateFilter === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        if (c.visitDate !== yStr) return false;
      }

      if (dateFilter === 'month') {
        const currentMonth = todayStr.substring(0, 7);
        if (!c.visitDate.startsWith(currentMonth)) return false;
      }

      // Type Filter
      if (typeFilter !== 'all' && c.customerType !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Therapist Filter
      if (therapistFilter !== 'all' && c.therapistName !== therapistFilter) return false;

      return true;
    });
  }, [customers, searchTerm, dateFilter, typeFilter, statusFilter, therapistFilter]);

  // Sorting memoized
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amountPaid - a.amountPaid : a.amountPaid - b.amountPaid;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      // Default date
      return sortOrder === 'desc' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt);
    });
  }, [filteredCustomers, sortBy, sortOrder]);

  // Pagination & page preservation
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedCustomers = useMemo(() => {
    return sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedCustomers, currentPage, itemsPerPage]);

  const handleStatusChange = async (c: Customer, newStatus: CustomerStatus) => {
    setActionError(null);
    try {
      await updateCustomer(c.id, { status: newStatus });
    } catch (err: any) {
      setActionError(err.message || 'Failed to update customer status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setActionError(null);
    if (confirm(`Are you sure you want to soft-delete customer record for ${name}? This record will be archived.`)) {
      try {
        await deleteCustomer(id);
      } catch (err: any) {
        setActionError(err.message || 'Failed to delete customer record.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-white">
            Customer Records Management
          </h2>
          <p className="text-xs text-gray-400">
            Showing {filteredCustomers.length} total customer check-ins and billing invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            title="Refresh database"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Customer Check-In</span>
          </button>
        </div>
      </div>

      {/* Global DB Error / Retry Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 flex items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refreshData()}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold border border-red-500/30 cursor-pointer whitespace-nowrap"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3 text-xs animate-fade-in">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-amber-400 font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Suite */}
      <div className="p-4 rounded-3xl glass-panel border border-[#D4AF37]/20 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Instant Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#D4AF37]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, mobile, invoice #..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={e => {
              setDateFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="all" className="bg-gray-900">All Dates</option>
            <option value="today" className="bg-gray-900">Today</option>
            <option value="yesterday" className="bg-gray-900">Yesterday</option>
            <option value="month" className="bg-gray-900">This Month</option>
          </select>

          {/* Customer Type Filter */}
          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="all" className="bg-gray-900">All Customer Types</option>
            <option value="Walk In" className="bg-gray-900">Walk In</option>
            <option value="Agent Customer" className="bg-gray-900">Agent Customer</option>
            <option value="Referral" className="bg-gray-900">Referral</option>
            <option value="Membership" className="bg-gray-900">Membership</option>
          </select>

          {/* Therapist Filter */}
          <select
            value={therapistFilter}
            onChange={e => {
              setTherapistFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="all" className="bg-gray-900">All Therapists</option>
            {therapists.map(t => (
              <option key={t.id} value={t.name} className="bg-gray-900">{t.name}</option>
            ))}
          </select>
        </div>

        {/* Quick Pills for Status & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium mr-1">Status:</span>
            {['all', 'Running', 'Completed', 'Cancelled'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer capitalize ${
                  statusFilter === s
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Sort:</span>
            <button
              onClick={() => {
                setSortBy('date');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Date</span>
              <ArrowUpDown className="h-3 w-3 text-[#D4AF37]" />
            </button>
            <button
              onClick={() => {
                setSortBy('amount');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Amount</span>
              <ArrowUpDown className="h-3 w-3 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (< md) */}
      <div className="block md:hidden space-y-3">
        {paginatedCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-400 glass-panel rounded-2xl text-xs">
            No customer records matching search criteria.
          </div>
        ) : (
          paginatedCustomers.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">
                      {c.invoiceNumber}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{c.mobile} • {c.gender}, {c.age}</p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    c.status === 'Running'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : c.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block text-[10px]">Therapist & Room</span>
                  <span className="font-medium text-white">{c.therapistName} ({c.roomNumber})</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px]">Amount & Method</span>
                  <span className="font-bold text-[#D4AF37]">{settings.currencySymbol}{c.amountPaid} ({c.paymentMethod})</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewProfile(c)}
                    className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white cursor-pointer"
                    title="View Profile"
                  >
                    <Eye className="h-4 w-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => onPrintInvoice(c)}
                    className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white cursor-pointer"
                    title="Print Invoice"
                  >
                    <Printer className="h-4 w-4 text-[#D4AF37]" />
                  </button>
                  <button
                    onClick={() => onEditCustomer(c)}
                    className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white cursor-pointer"
                    title="Edit Record"
                  >
                    <Edit className="h-4 w-4 text-amber-400" />
                  </button>
                </div>

                {/* Status Toggle Quick Buttons */}
                <div className="flex items-center gap-1">
                  {c.status === 'Running' && (
                    <button
                      onClick={() => handleStatusChange(c, 'Completed')}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
                    >
                      Mark Done
                    </button>
                  )}
                  {canDeleteCustomer && (
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (>= md) */}
      <div className="hidden md:block rounded-3xl glass-panel border border-[#D4AF37]/20 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/60 border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Customer Info</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Room & Therapist</th>
              <th className="p-4">Amount & Method</th>
              <th className="p-4">Type / Agent</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-200">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  No customer records matching search criteria.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map(c => (
                <tr key={c.id} className="hover:bg-[#D4AF37]/5 transition-colors group">
                  <td className="p-4 font-bold text-[#D4AF37]">{c.invoiceNumber}</td>
                  <td className="p-4">
                    <p className="font-bold text-white text-sm group-hover:text-[#D4AF37] transition-colors">{c.name}</p>
                    <p className="text-[11px] text-gray-400">{c.mobile} ({c.gender}, {c.age})</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-white">{c.visitDate}</p>
                    <p className="text-[11px] text-gray-400">{c.checkInTime} - {c.checkOutTime}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-white">{c.therapistName}</p>
                    <p className="text-[11px] text-gray-400">{c.roomNumber}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#D4AF37] text-sm">{settings.currencySymbol}{c.amountPaid}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{c.paymentMethod}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[10px] font-medium border border-white/10">
                      {c.customerType}
                    </span>
                    {c.agentName && (
                      <p className="text-[10px] text-amber-300 mt-1">Ref: {c.agentName}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        c.status === 'Running'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : c.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewProfile(c)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPrintInvoice(c)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4AF37] cursor-pointer"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditCustomer(c)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {canDeleteCustomer && (
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 glass-panel rounded-2xl text-xs text-gray-400">
        <span>Page {currentPage} of {totalPages} ({filteredCustomers.length} total entries)</span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
