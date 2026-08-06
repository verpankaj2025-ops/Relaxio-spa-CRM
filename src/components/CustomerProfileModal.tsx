import React from 'react';
import { X, User, Phone, Calendar, Printer, Edit, History, Award, Sparkles, CheckCircle, Clock, Ban } from 'lucide-react';
import { Customer } from '../types';
import { useSpaData } from '../context/SpaDataContext';

interface CustomerProfileModalProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onPrintInvoice: (customer: Customer) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  onClose,
  onEdit,
  onPrintInvoice,
}) => {
  const { customers, settings } = useSpaData();

  if (!customer) return null;

  // Find all historical visits for this customer's mobile number
  const visitHistory = customers.filter(c => c.mobile === customer.mobile);
  const totalSpend = visitHistory.reduce((sum, c) => sum + (c.status !== 'Cancelled' ? c.amountPaid : 0), 0);

  // Preferred Therapist
  const therapistCounts: Record<string, number> = {};
  visitHistory.forEach(c => {
    if (c.therapistName) {
      therapistCounts[c.therapistName] = (therapistCounts[c.therapistName] || 0) + 1;
    }
  });
  const topTherapist = Object.keys(therapistCounts).sort((a, b) => therapistCounts[b] - therapistCounts[a])[0] || customer.therapistName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl glass-panel border border-[#D4AF37]/30 shadow-2xl overflow-hidden my-8">
        {/* Profile Banner */}
        <div className="p-6 bg-gradient-to-r from-black/80 via-[#1F1E28] to-black/80 border-b border-[#D4AF37]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E5C158] via-[#D4AF37] to-[#B8860B] text-black font-serif-luxury font-bold text-2xl shadow-lg shadow-[#D4AF37]/20">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-xl font-bold text-white">
                  {customer.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                  {customer.customerType}
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                {customer.mobile}
                <span>•</span>
                <span>{customer.gender}, {customer.age} yrs</span>
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => onPrintInvoice(customer)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#D4AF37]" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(customer);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-button-gradient text-xs font-bold shadow-md cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-black/40 border-b border-white/5 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total Lifetime Spend</p>
            <p className="text-lg font-bold text-[#D4AF37] mt-0.5">{settings.currencySymbol}{totalSpend}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total Spa Visits</p>
            <p className="text-lg font-bold text-white mt-0.5">{visitHistory.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Preferred Therapist</p>
            <p className="text-xs font-bold text-gray-200 mt-1 truncate">{topTherapist}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Current Status</p>
            <p className={`text-xs font-bold mt-1 ${customer.status === 'Running' ? 'text-amber-400' : customer.status === 'Completed' ? 'text-emerald-400' : 'text-red-400'}`}>
              {customer.status}
            </p>
          </div>
        </div>

        {/* Visit History Section */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          <h3 className="font-serif-luxury text-sm font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-[#D4AF37]" />
            <span>Complete Visit & Payment History</span>
          </h3>

          <div className="space-y-3">
            {visitHistory.map((visit, idx) => (
              <div
                key={visit.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-[#D4AF37]/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#D4AF37]">{visit.invoiceNumber}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {visit.visitDate} ({visit.checkInTime} - {visit.checkOutTime})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      visit.status === 'Running'
                        ? 'bg-amber-500/20 text-amber-300'
                        : visit.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {visit.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                    {visit.status === 'Running' && <Clock className="h-3 w-3" />}
                    {visit.status === 'Cancelled' && <Ban className="h-3 w-3" />}
                    {visit.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-500">Therapist: </span>
                    <span className="font-medium text-white">{visit.therapistName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Room: </span>
                    <span className="font-medium text-white">{visit.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment: </span>
                    <span className="font-bold text-[#D4AF37]">{settings.currencySymbol}{visit.amountPaid} ({visit.paymentMethod})</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  <span className="text-gray-500">Services Taken: </span>
                  <span className="text-gray-200">{visit.services.join(', ')}</span>
                </div>

                {visit.remarks && (
                  <p className="text-[11px] text-amber-200/80 bg-amber-500/10 p-2 rounded-xl italic">
                    "{visit.remarks}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-black/60 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
