import React, { useState, useEffect } from 'react';
import { Search, X, User, Phone, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useSpaData } from '../context/SpaDataContext';
import { Customer } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const { customers } = useSpaData();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchTerm.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm) ||
        c.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.agentName && c.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : customers.slice(0, 5); // Default show recent 5

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl glass-panel border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 light:border-black/10">
          <Search className="h-5 w-5 text-[#D4AF37]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Type name, mobile, invoice #, therapist or agent..."
            className="w-full bg-transparent text-sm text-white light:text-black placeholder-gray-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No customer records found matching "{searchTerm}"
            </div>
          ) : (
            results.map(c => (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCustomer(c);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white light:text-gray-900 group-hover:text-[#D4AF37]">
                      {c.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">
                      {c.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'Running'
                          ? 'bg-amber-500/20 text-amber-300'
                          : c.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {c.mobile}
                    </span>
                    <span>•</span>
                    <span>Therapist: {c.therapistName}</span>
                    <span>•</span>
                    <span>{c.roomNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-bold text-[#D4AF37]">₹{c.amountPaid}</p>
                    <p className="text-[10px] text-gray-400">{c.paymentMethod}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-[#D4AF37] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-black/40 text-[11px] text-gray-400 border-t border-white/5 flex justify-between items-center">
          <span>Showing {results.length} matching entries</span>
          <span className="text-[10px] text-gray-500">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
