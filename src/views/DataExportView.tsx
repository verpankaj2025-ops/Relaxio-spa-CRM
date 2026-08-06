import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Calendar, Filter, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSpaData } from '../context/SpaDataContext';

export const DataExportView: React.FC = () => {
  const { canExport } = useAuth();
  const { customers, therapists, agents, settings } = useSpaData();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'print'>('csv');

  if (!canExport) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl border border-red-500/30 max-w-md mx-auto my-12 space-y-3">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="font-serif-luxury text-lg font-bold text-white">Export Restricted</h2>
        <p className="text-xs text-gray-400">
          Only Super Admin accounts have permission to download raw customer and financial data records.
        </p>
      </div>
    );
  }

  // Filter records based on selected controls
  const filteredRecords = customers.filter(c => {
    if (c.visitDate < startDate || c.visitDate > endDate) return false;
    if (selectedTherapist !== 'all' && c.therapistId !== selectedTherapist) return false;
    if (selectedAgent !== 'all' && c.agentId !== selectedAgent) return false;
    return true;
  });

  const totalExportRevenue = filteredRecords.reduce((sum, c) => sum + (c.status !== 'Cancelled' ? c.amountPaid : 0), 0);

  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Customer Name',
      'Mobile Number',
      'Gender',
      'Age',
      'Visit Date',
      'Check In',
      'Check Out',
      'Room',
      'Therapist',
      'Amount Paid',
      'Payment Method',
      'Customer Type',
      'Agent Name',
      'Services',
      'Status',
      'Remarks',
    ];

    const rows = filteredRecords.map(c => [
      c.invoiceNumber,
      `"${c.name.replace(/"/g, '""')}"`,
      c.mobile,
      c.gender,
      c.age,
      c.visitDate,
      c.checkInTime,
      c.checkOutTime,
      c.roomNumber,
      `"${c.therapistName.replace(/"/g, '""')}"`,
      c.amountPaid,
      c.paymentMethod,
      c.customerType,
      `"${(c.agentName || '').replace(/"/g, '""')}"`,
      `"${c.services.join('; ').replace(/"/g, '""')}"`,
      c.status,
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relaxio_Spa_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Relaxio_Spa_Records_${startDate}_to_${endDate}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-[#D4AF37]" />
          <span>Super Admin Data Export Suite</span>
        </h2>
        <p className="text-xs text-gray-400">
          Export financial records, therapist performance, and agent commissions in Excel/CSV or PDF formats.
        </p>
      </div>

      {/* Export Filters Grid */}
      <div className="p-6 rounded-3xl glass-panel border border-[#D4AF37]/30 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Therapist Filter</label>
            <select
              value={selectedTherapist}
              onChange={e => setSelectedTherapist(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all" className="bg-gray-900">All Therapists</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Agent Referral Filter</label>
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all" className="bg-gray-900">All Agents</option>
              {agents.map(a => (
                <option key={a.id} value={a.id} className="bg-gray-900">{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Metric Preview */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Matching Export Records</p>
            <p className="text-xl font-bold text-white mt-0.5">{filteredRecords.length} Customer Invoices</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Revenue Selected</p>
            <p className="text-xl font-bold text-[#D4AF37] mt-0.5">{settings.currencySymbol}{totalExportRevenue.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Excel / CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
            >
              <FileText className="h-4 w-4 text-[#D4AF37]" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="rounded-3xl glass-panel border border-[#D4AF37]/20 overflow-hidden">
        <div className="p-4 bg-black/60 border-b border-white/10 flex justify-between items-center">
          <span className="font-serif-luxury text-sm font-bold text-white">Export Dataset Preview</span>
          <span className="text-xs text-gray-400">First {Math.min(filteredRecords.length, 5)} entries displayed</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[#D4AF37] uppercase font-bold text-[10px]">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Therapist</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {filteredRecords.slice(0, 5).map(c => (
              <tr key={c.id}>
                <td className="p-3 font-bold text-[#D4AF37]">{c.invoiceNumber}</td>
                <td className="p-3">{c.visitDate}</td>
                <td className="p-3 font-medium text-white">{c.name} ({c.mobile})</td>
                <td className="p-3">{c.therapistName}</td>
                <td className="p-3 font-bold text-white">{settings.currencySymbol}{c.amountPaid}</td>
                <td className="p-3">{c.paymentMethod}</td>
                <td className="p-3 font-semibold">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
