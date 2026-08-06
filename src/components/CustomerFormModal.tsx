import React, { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, Clock, Sparkles, AlertCircle, Camera, Check, ShieldAlert, Upload, Image as ImageIcon } from 'lucide-react';
import { useSpaData } from '../context/SpaDataContext';
import { Customer, PaymentMethod, CustomerType, CustomerStatus } from '../types';
import { uploadCustomerPhoto } from '../supabaseClient';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomer?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  initialCustomer,
}) => {
  const { therapists, rooms, agents, services, addCustomer, updateCustomer, checkDuplicateMobile, settings } = useSpaData();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [age, setAge] = useState<number>(30);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('10:30');
  const [checkOutTime, setCheckOutTime] = useState('11:30');
  const [roomId, setRoomId] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(2500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [customerType, setCustomerType] = useState<CustomerType>('Walk In');
  const [agentId, setAgentId] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['Deep Tissue Full Body Massage']);
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('Running');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto set defaults if empty
  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name);
      setMobile(initialCustomer.mobile);
      setGender(initialCustomer.gender);
      setAge(initialCustomer.age);
      setVisitDate(initialCustomer.visitDate);
      setCheckInTime(initialCustomer.checkInTime);
      setCheckOutTime(initialCustomer.checkOutTime || '11:30');
      setRoomId(initialCustomer.roomId);
      setTherapistId(initialCustomer.therapistId);
      setAmountPaid(initialCustomer.amountPaid);
      setPaymentMethod(initialCustomer.paymentMethod);
      setCustomerType(initialCustomer.customerType);
      setAgentId(initialCustomer.agentId || '');
      setSelectedServices(initialCustomer.services || []);
      setRemarks(initialCustomer.remarks || '');
      setPhotoUrl(initialCustomer.photoUrl || '');
      setStatus(initialCustomer.status);
    } else {
      setName('');
      setMobile('');
      setGender('Female');
      setAge(30);
      setVisitDate(new Date().toISOString().split('T')[0]);
      const now = new Date();
      const inTime = now.toTimeString().substring(0, 5);
      now.setHours(now.getHours() + 1);
      const outTime = now.toTimeString().substring(0, 5);
      setCheckInTime(inTime);
      setCheckOutTime(outTime);
      setRoomId(rooms[0]?.id || '');
      setTherapistId(therapists[0]?.id || '');
      setAmountPaid(2500);
      setPaymentMethod('UPI');
      setCustomerType('Walk In');
      setAgentId('');
      setSelectedServices(services.length > 0 ? [services[0].name] : []);
      setRemarks('');
      setPhotoUrl('');
      setStatus('Running');
    }
  }, [initialCustomer, isOpen, rooms, therapists, services]);

  // Duplicate Mobile Lookup
  const duplicateInfo = checkDuplicateMobile(mobile);

  if (!isOpen) return null;

  const handleToggleService = (sName: string) => {
    if (selectedServices.includes(sName)) {
      setSelectedServices(selectedServices.filter(s => s !== sName));
    } else {
      setSelectedServices([...selectedServices, sName]);
    }
  };

  const handleAutofillCustomer = () => {
    if (duplicateInfo.found) {
      setName(duplicateInfo.customerName);
      if (duplicateInfo.previousServices.length > 0) {
        setSelectedServices(duplicateInfo.previousServices);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert('Customer Name and Mobile Number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedRoom = rooms.find(r => r.id === roomId);
      const selectedTherapist = therapists.find(t => t.id === therapistId);
      const selectedAgent = agents.find(a => a.id === agentId);

      const payload: Partial<Customer> = {
        name,
        mobile,
        gender,
        age: Number(age),
        visitDate,
        checkInTime,
        checkOutTime,
        roomId: roomId || 'rm-101',
        roomNumber: selectedRoom ? selectedRoom.roomNumber : 'Room 101',
        therapistId: therapistId || 'th-1',
        therapistName: selectedTherapist ? selectedTherapist.name : 'Maya Lin',
        amountPaid: Number(amountPaid),
        paymentMethod,
        customerType,
        agentId: customerType === 'Agent Customer' ? agentId : undefined,
        agentName: customerType === 'Agent Customer' && selectedAgent ? selectedAgent.name : undefined,
        services: selectedServices,
        remarks,
        photoUrl,
        status,
      };

      if (initialCustomer) {
        await updateCustomer(initialCustomer.id, payload);
      } else {
        await addCustomer(payload);
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving customer entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-[#D4AF37]/30 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-black/60 via-[#1A1918] to-black/60 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-base font-bold text-white">
                {initialCustomer ? 'Edit Customer Entry' : 'New Customer Check-In'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {initialCustomer ? `Invoice: ${initialCustomer.invoiceNumber}` : 'Auto-generates luxury invoice number'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Duplicate Mobile Banner */}
          {duplicateInfo.found && !initialCustomer && (
            <div className="p-3.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-between gap-3 animate-fade-in">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                  <AlertCircle className="h-4 w-4" />
                  <span>Returning Customer Detected!</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  {duplicateInfo.customerName} has visited {duplicateInfo.totalVisits} time(s). Total Spend: {settings.currencySymbol}{duplicateInfo.totalSpend}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutofillCustomer}
                className="px-3 py-1.5 rounded-xl gold-button-gradient text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
              >
                Autofill Info
              </button>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Customer Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="10-digit phone number"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="Male" className="bg-gray-900">Male</option>
                <option value="Female" className="bg-gray-900">Female</option>
                <option value="Other" className="bg-gray-900">Other</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Visit Date</label>
              <input
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Check In Time</label>
              <input
                type="time"
                value={checkInTime}
                onChange={e => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Check Out Time</label>
              <input
                type="time"
                value={checkOutTime}
                onChange={e => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Room & Therapist Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Assigned Room</label>
              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              >
                {rooms.length === 0 ? (
                  <option value="" className="bg-gray-900">No rooms added yet (Select None)</option>
                ) : (
                  rooms.map(r => (
                    <option key={r.id} value={r.id} className="bg-gray-900">
                      {r.roomNumber} ({r.type}) - {r.status.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Therapist</label>
              <select
                value={therapistId}
                onChange={e => setTherapistId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              >
                {therapists.length === 0 ? (
                  <option value="" className="bg-gray-900">No therapists added yet (Select None)</option>
                ) : (
                  therapists.map(t => (
                    <option key={t.id} value={t.id} className="bg-gray-900">
                      {t.name} ({t.specialization})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Amount Paid ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={e => setAmountPaid(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 font-bold focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Payment Method</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Cash', 'UPI', 'Card', 'Wallet'] as PaymentMethod[]).map(pm => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === pm
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-black/30 text-gray-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Type & Conditional Agent Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Type</label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value as CustomerType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="Walk In" className="bg-gray-900">Walk In</option>
                <option value="Agent Customer" className="bg-gray-900">Agent Customer</option>
                <option value="Referral" className="bg-gray-900">Referral</option>
                <option value="Membership" className="bg-gray-900">Membership</option>
              </select>
            </div>

            {customerType === 'Agent Customer' && (
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] mb-1">Agent Name *</label>
                <select
                  value={agentId}
                  onChange={e => setAgentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-white light:text-gray-900 focus:outline-none"
                >
                  <option value="" className="bg-gray-900">-- Select Agent --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id} className="bg-gray-900">
                      {a.name} ({a.commissionPct}% Comm)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Services Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Services Taken</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-black/20 rounded-2xl border border-white/5">
              {services.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-1 px-2">No services configured yet. Add services in Settings & Backups tab.</p>
              ) : (
                services.map(srv => {
                  const isSelected = selectedServices.includes(srv.name);
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleToggleService(srv.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 font-semibold'
                          : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{srv.name} ({settings.currencySymbol}{srv.price})</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Remarks & Session Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Session Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CustomerStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none font-semibold"
              >
                <option value="Running" className="bg-gray-900 text-amber-400">Running (Active In Room)</option>
                <option value="Completed" className="bg-gray-900 text-emerald-400">Completed</option>
                <option value="Cancelled" className="bg-gray-900 text-red-400">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Remarks / Preferences</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Deep shoulder massage preference"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-gray-900 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Customer Photo Upload / URL */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-[#D4AF37]" />
                <span>Customer ID / Profile Photo</span>
              </label>
              {photoUrl && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Photo Attached
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://... or upload photo to Supabase storage"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
              />
              <label className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadCustomerPhoto(file, `${name || 'customer'}_${file.name}`);
                      if (url) {
                        setPhotoUrl(url);
                      } else {
                        // Fallback preview URL if Supabase bucket isn't set up yet
                        const reader = new FileReader();
                        reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                />
              </label>
            </div>
            {photoUrl && (
              <div className="flex items-center gap-2 pt-1">
                <img src={photoUrl} alt="Customer Photo Preview" className="h-10 w-10 rounded-xl object-cover border border-[#D4AF37]/40" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : initialCustomer ? 'Update Entry' : 'Generate Entry & Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
