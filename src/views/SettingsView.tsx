import React, { useState } from 'react';
import { Settings, UserCheck, DoorOpen, Users, Scissors, Building, Save, Plus, Check, Database, ShieldCheck, ExternalLink } from 'lucide-react';
import { useSpaData } from '../context/SpaDataContext';
import { isSupabaseConfigured, supabaseUrl } from '../supabaseClient';

export const SettingsView: React.FC = () => {
  const { settings, therapists, rooms, agents, services, saveSettings, addTherapist, addRoom, addAgent, addService } = useSpaData();

  const [activeTab, setActiveTab] = useState<'business' | 'therapists' | 'rooms' | 'agents' | 'services'>('business');

  // Business Info Form
  const [spaName, setSpaName] = useState(settings.spaName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [inactivityTimeoutMins, setInactivityTimeoutMins] = useState(settings.inactivityTimeoutMins);

  // New Item Quick Forms
  const [newTherapistName, setNewTherapistName] = useState('');
  const [newTherapistPhone, setNewTherapistPhone] = useState('');
  const [newTherapistSpec, setNewTherapistSpec] = useState('');

  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<'Standard' | 'VIP Deluxe' | 'Couples Suite' | 'Ayurvedic Room'>('Standard');

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentComm, setNewAgentComm] = useState(10);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(2000);
  const [newServiceDuration, setNewServiceDuration] = useState(60);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      ...settings,
      spaName,
      tagline,
      phone,
      email,
      address,
      gstNumber,
      currencySymbol,
      inactivityTimeoutMins,
    });
    alert('Spa settings saved successfully!');
  };

  const handleAddTherapist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTherapistName) return;
    await addTherapist({ name: newTherapistName, phone: newTherapistPhone, specialization: newTherapistSpec });
    setNewTherapistName('');
    setNewTherapistPhone('');
    setNewTherapistSpec('');
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;
    await addRoom({ roomNumber: newRoomNumber, type: newRoomType });
    setNewRoomNumber('');
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;
    await addAgent({ name: newAgentName, phone: newAgentPhone, commissionPct: newAgentComm });
    setNewAgentName('');
    setNewAgentPhone('');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    await addService({ name: newServiceName, price: newServicePrice, durationMins: newServiceDuration, category: 'General' });
    setNewServiceName('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#D4AF37]" />
          <span>System Settings & Operational Master Data</span>
        </h2>
        <p className="text-xs text-gray-400">
          Configure business details, therapist rosters, rooms, partner agents, and therapy services.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'business', label: 'Business Profile', icon: Building },
          { id: 'therapists', label: 'Therapists Roster', icon: UserCheck },
          { id: 'rooms', label: 'Spa Rooms', icon: DoorOpen },
          { id: 'agents', label: 'Partner Agents', icon: Users },
          { id: 'services', label: 'Therapy Services', icon: Scissors },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-bold'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* BUSINESS TAB */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          {/* Supabase Connection Status Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1918] via-black to-[#0F0E0D] border border-[#D4AF37]/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif-luxury text-sm font-bold text-white flex items-center gap-2">
                    Supabase Live Database Connection
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Real-time PostgreSQL database, authentication & storage setup
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSupabaseConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Live Supabase Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Pending Environment Variables
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Supabase Endpoint URL</span>
                <p className="font-mono text-gray-200 truncate">{supabaseUrl || 'https://your-supabase-project.supabase.co'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Environment Variable Names</span>
                <p className="font-mono text-[#D4AF37]">NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 leading-relaxed pt-1 flex items-start gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
              <ExternalLink className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>
                To execute migrations or create tables in your live Supabase project, copy and run the complete SQL script located in <strong className="text-white">/supabase/schema.sql</strong> inside your <strong className="text-[#D4AF37]">Supabase SQL Editor</strong>.
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveBusiness} className="p-6 rounded-3xl glass-panel border border-[#D4AF37]/30 space-y-4">
            <h3 className="font-serif-luxury text-sm font-bold text-white">Business & Tax Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">Spa Name</label>
              <input
                type="text"
                value={spaName}
                onChange={e => setSpaName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-300 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">GSTIN Tax Registration Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">Auto Logout Inactivity Timeout</label>
              <select
                value={inactivityTimeoutMins}
                onChange={e => setInactivityTimeoutMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white light:text-black"
              >
                <option value={1} className="bg-gray-900">1 Minute (Strict)</option>
                <option value={5} className="bg-gray-900">5 Minutes (Default Standard)</option>
                <option value={15} className="bg-gray-900">15 Minutes</option>
                <option value={30} className="bg-gray-900">30 Minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* THERAPISTS TAB */}
      {activeTab === 'therapists' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTherapist} className="p-4 rounded-3xl glass-panel border border-[#D4AF37]/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              value={newTherapistName}
              onChange={e => setNewTherapistName(e.target.value)}
              placeholder="Therapist Name"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
              required
            />
            <input
              type="text"
              value={newTherapistPhone}
              onChange={e => setNewTherapistPhone(e.target.value)}
              placeholder="Phone Number"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            />
            <input
              type="text"
              value={newTherapistSpec}
              onChange={e => setNewTherapistSpec(e.target.value)}
              placeholder="Specialization (e.g. Deep Tissue)"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            />
            <button type="submit" className="px-4 py-2 rounded-xl gold-button-gradient font-bold cursor-pointer flex items-center justify-center gap-1">
              <Plus className="h-4 w-4" /> Add Therapist
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {therapists.map(t => (
              <div key={t.id} className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{t.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase font-semibold">{t.status}</span>
                </div>
                <p className="text-gray-400">{t.specialization}</p>
                <div className="flex justify-between pt-2 border-t border-white/5 text-gray-300">
                  <span>Sessions: {t.totalSessions}</span>
                  <span className="font-bold text-[#D4AF37]">{settings.currencySymbol}{t.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <form onSubmit={handleAddRoom} className="p-4 rounded-3xl glass-panel border border-[#D4AF37]/30 flex flex-col sm:flex-row gap-3 text-xs">
            <input
              type="text"
              value={newRoomNumber}
              onChange={e => setNewRoomNumber(e.target.value)}
              placeholder="e.g. Room 107"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white flex-1"
              required
            />
            <select
              value={newRoomType}
              onChange={e => setNewRoomType(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            >
              <option value="Standard" className="bg-gray-900">Standard</option>
              <option value="VIP Deluxe" className="bg-gray-900">VIP Deluxe</option>
              <option value="Couples Suite" className="bg-gray-900">Couples Suite</option>
              <option value="Ayurvedic Room" className="bg-gray-900">Ayurvedic Room</option>
            </select>
            <button type="submit" className="px-5 py-2 rounded-xl gold-button-gradient font-bold cursor-pointer whitespace-nowrap">
              + Add Room
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rooms.map(r => (
              <div key={r.id} className="p-4 rounded-2xl glass-panel border border-white/10 text-xs text-center space-y-1">
                <p className="font-bold text-white text-base">{r.roomNumber}</p>
                <p className="text-gray-400 text-[11px]">{r.type}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.status === 'occupied' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGENTS TAB */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <form onSubmit={handleAddAgent} className="p-4 rounded-3xl glass-panel border border-[#D4AF37]/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              value={newAgentName}
              onChange={e => setNewAgentName(e.target.value)}
              placeholder="Agent Name (e.g. Hyatt Concierge)"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
              required
            />
            <input
              type="text"
              value={newAgentPhone}
              onChange={e => setNewAgentPhone(e.target.value)}
              placeholder="Phone Number"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            />
            <input
              type="number"
              value={newAgentComm}
              onChange={e => setNewAgentComm(Number(e.target.value))}
              placeholder="Commission %"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            />
            <button type="submit" className="px-4 py-2 rounded-xl gold-button-gradient font-bold cursor-pointer">
              + Add Agent
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {agents.map(a => (
              <div key={a.id} className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2 text-xs">
                <p className="font-bold text-white text-sm">{a.name}</p>
                <p className="text-gray-400">{a.phone}</p>
                <div className="flex justify-between pt-2 border-t border-white/5 text-gray-300">
                  <span>Commission: <strong className="text-[#D4AF37]">{a.commissionPct}%</strong></span>
                  <span>Referrals: {a.totalReferrals}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <form onSubmit={handleAddService} className="p-4 rounded-3xl glass-panel border border-[#D4AF37]/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              value={newServiceName}
              onChange={e => setNewServiceName(e.target.value)}
              placeholder="Service Name (e.g. Thai Foot Spa)"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
              required
            />
            <input
              type="number"
              value={newServicePrice}
              onChange={e => setNewServicePrice(Number(e.target.value))}
              placeholder="Price (₹)"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            />
            <input
              type="number"
              value={newServiceDuration}
              onChange={e => setNewServiceDuration(Number(e.target.value))}
              placeholder="Duration Mins"
              className="px-3 py-2 rounded-xl bg-black/40 light:bg-gray-100 border border-white/10 text-white"
            />
            <button type="submit" className="px-4 py-2 rounded-xl gold-button-gradient font-bold cursor-pointer">
              + Add Service
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.id} className="p-4 rounded-2xl glass-panel border border-white/10 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{s.name}</p>
                  <p className="text-gray-400 text-[11px]">{s.durationMins} Mins duration</p>
                </div>
                <span className="font-bold text-[#D4AF37] text-base">{settings.currencySymbol}{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
