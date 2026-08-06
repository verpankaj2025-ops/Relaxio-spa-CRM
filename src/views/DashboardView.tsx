import React from 'react';
import { DollarSign, Users, Award, UserCheck, DoorOpen, CreditCard, TrendingUp, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { useSpaData } from '../context/SpaDataContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const DashboardView: React.FC<{ onOpenNewCustomer: () => void }> = ({ onOpenNewCustomer }) => {
  const { stats, settings, rooms, customers } = useSpaData();

  const PIE_COLORS = ['#E5C158', '#34D399', '#60A5FA', '#F472B6'];

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-[#D4AF37]/30 bg-gradient-to-r from-black/80 via-[#1A1924] to-black/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
            Realtime Operational Dashboard
          </span>
          <h2 className="font-serif-luxury text-2xl font-bold text-white mt-2">
            Welcome to {settings.spaName}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Overview of today's revenue, active therapies, room occupancy & top performers.
          </p>
        </div>
        <button
          onClick={onOpenNewCustomer}
          className="px-5 py-2.5 rounded-xl gold-button-gradient text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          + Check In Customer
        </button>
      </div>

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Revenue */}
        <div className="p-4 rounded-2xl glass-panel border border-[#D4AF37]/20 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 gold-gradient-text">
            {settings.currencySymbol}{stats.todayRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+14%</span> vs yesterday
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 rounded-2xl glass-panel border border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Monthly Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {settings.currencySymbol}{stats.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Avg Bill: {settings.currencySymbol}{stats.averageBill}
          </p>
        </div>

        {/* Today's Customers & Running Sessions */}
        <div className="p-4 rounded-2xl glass-panel border border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Today's Guests</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.todayCustomersCount}
          </p>
          <p className="text-[11px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            {stats.runningSessionsCount} Active in rooms
          </p>
        </div>

        {/* Room Occupancy */}
        <div className="p-4 rounded-2xl glass-panel border border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Room Occupancy</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DoorOpen className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.roomOccupancyPct}%
          </p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.roomOccupancyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performers & Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Therapist */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37]">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Top Therapist</p>
            <p className="text-sm font-bold text-white mt-0.5">{stats.topTherapistName}</p>
            <p className="text-[11px] text-[#D4AF37] font-medium">Highest Customer Rating & Sessions</p>
          </div>
        </div>

        {/* Top Agent */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Top Partner Agent</p>
            <p className="text-sm font-bold text-white mt-0.5">{stats.topAgentName}</p>
            <p className="text-[11px] text-indigo-300 font-medium">Leading Hotel & Travel Referral</p>
          </div>
        </div>

        {/* Total Lifetime Guests */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Served Records</p>
            <p className="text-sm font-bold text-white mt-0.5">{stats.totalCustomersCount} Visitors</p>
            <p className="text-[11px] text-emerald-300 font-medium">100% Unique Invoice History</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-panel border border-[#D4AF37]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-luxury text-sm font-bold text-white">Daily Revenue Trend</h3>
              <p className="text-xs text-gray-400">Past 7 days income & guest frequency</p>
            </div>
            <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
              7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1924', borderColor: '#D4AF37', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Breakdown Panel */}
        <div className="p-5 rounded-3xl glass-panel border border-[#D4AF37]/20 space-y-4">
          <div>
            <h3 className="font-serif-luxury text-sm font-bold text-white">Payment Method Breakdown</h3>
            <p className="text-xs text-gray-400">Revenue split across channels</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.paymentBreakdown).map(([method, val]) => {
              const amount = Number(val);
              const total = stats.monthlyRevenue || 1;
              const pct = Math.round((amount / total) * 100);
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-300">{method}</span>
                    <span className="font-bold text-[#D4AF37]">{settings.currencySymbol}{amount.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#E5C158] to-[#B8860B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Room Status Matrix */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs font-bold text-gray-300">Live Room Status</p>
            <div className="grid grid-cols-3 gap-2">
              {rooms.map(r => (
                <div
                  key={r.id}
                  className={`p-2 rounded-xl text-center text-[10px] font-bold border ${
                    r.status === 'occupied'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : r.status === 'available'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-gray-500/20 border-gray-500/40 text-gray-400'
                  }`}
                >
                  <p>{r.roomNumber}</p>
                  <p className="text-[9px] font-normal uppercase">{r.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
