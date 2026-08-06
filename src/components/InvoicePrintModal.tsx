import React from 'react';
import { X, Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { Customer } from '../types';
import { useSpaData } from '../context/SpaDataContext';

interface InvoicePrintModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ customer, onClose }) => {
  const { settings } = useSpaData();

  if (!customer) return null;

  const handlePrint = () => {
    window.print();
  };

  const gstAmount = Math.round(customer.amountPaid * 0.18);
  const baseAmount = customer.amountPaid - gstAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl glass-panel border border-[#D4AF37]/40 shadow-2xl overflow-hidden my-6">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3 bg-black/60 border-b border-white/10 print:hidden">
          <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Official Tax Invoice Preview</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl gold-button-gradient text-xs font-bold shadow-md cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div className="print-area p-8 bg-white text-gray-900 font-sans space-y-6">
          {/* Invoice Spa Header */}
          <div className="flex items-start justify-between border-b-2 border-[#D4AF37] pb-4">
            <div>
              <h1 className="font-serif-luxury text-2xl font-bold text-gray-900 tracking-wide uppercase">
                {settings.spaName}
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{settings.tagline}</p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">{settings.address}</p>
              <p className="text-[11px] text-gray-500">GSTIN: {settings.gstNumber} | Ph: {settings.phone}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-md uppercase tracking-wider">
                INVOICE
              </span>
              <p className="text-sm font-bold text-gray-900">{customer.invoiceNumber}</p>
              <p className="text-xs text-gray-500">Date: {customer.visitDate}</p>
              <p className="text-xs text-gray-500">Time: {customer.checkInTime} - {customer.checkOutTime}</p>
            </div>
          </div>

          {/* Customer & Session Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs border border-gray-200">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Customer Details</p>
              <p className="font-bold text-sm text-gray-900 mt-1">{customer.name}</p>
              <p className="text-gray-600">{customer.mobile}</p>
              <p className="text-gray-600">{customer.gender}, {customer.age} yrs ({customer.customerType})</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Session Details</p>
              <p className="font-medium text-gray-800 mt-1">Therapist: {customer.therapistName}</p>
              <p className="text-gray-600">Assigned: {customer.roomNumber}</p>
              {customer.agentName && <p className="text-gray-600">Ref Agent: {customer.agentName}</p>}
            </div>
          </div>

          {/* Services Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-600 font-bold uppercase text-[10px]">
                <th className="py-2">Service Description</th>
                <th className="py-2">Therapist</th>
                <th className="py-2 text-right">Amount ({settings.currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customer.services.map((srv, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-gray-900">{srv}</td>
                  <td className="py-3 text-gray-600">{customer.therapistName}</td>
                  <td className="py-3 text-right font-bold text-gray-900">
                    {idx === 0 ? settings.currencySymbol + baseAmount : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Base Value):</span>
                <span>{settings.currencySymbol}{baseAmount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18% Included):</span>
                <span>{settings.currencySymbol}{gstAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t-2 border-gray-900 pt-2">
                <span>Total Amount Paid:</span>
                <span className="text-amber-800">{settings.currencySymbol}{customer.amountPaid}</span>
              </div>
              <p className="text-[11px] text-right text-gray-500 italic mt-1">
                Payment Mode: <strong className="uppercase">{customer.paymentMethod}</strong> (RECEIVED)
              </p>
            </div>
          </div>

          {/* Footer & Thank you */}
          <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-800">Thank you for visiting {settings.spaName}!</p>
            <p className="text-[11px]">This is a computer generated invoice and requires no physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
