import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Customer, Therapist, Room, Agent, Service, AuditLog, SpaSettings, DashboardStats } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface DuplicateMobileInfo {
  found: boolean;
  customerName: string;
  totalVisits: number;
  totalSpend: number;
  lastVisitDate: string;
  previousTherapist: string;
  previousServices: string[];
}

interface SpaDataContextType {
  customers: Customer[];
  therapists: Therapist[];
  rooms: Room[];
  agents: Agent[];
  services: Service[];
  auditLogs: AuditLog[];
  settings: SpaSettings;
  stats: DashboardStats;
  loading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  refreshData: () => Promise<void>;
  addCustomer: (customerData: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  checkDuplicateMobile: (mobile: string) => DuplicateMobileInfo;
  saveSettings: (newSettings: SpaSettings) => Promise<void>;
  addTherapist: (t: Partial<Therapist>) => Promise<void>;
  addRoom: (r: Partial<Room>) => Promise<void>;
  addAgent: (a: Partial<Agent>) => Promise<void>;
  addService: (s: Partial<Service>) => Promise<void>;
  restoreBackup: (backupJSON: any) => Promise<void>;
}

const SpaDataContext = createContext<SpaDataContextType | undefined>(undefined);

export const SpaDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SpaSettings>({
    spaName: 'Relaxio Spa & Wellness',
    tagline: 'Luxury Rejuvenation & Holistic Care',
    phone: '+91 98765 43210',
    email: 'contact@relaxiospa.com',
    address: 'Suite 402, Golden Palm Tower, MG Road, Mumbai',
    gstNumber: '27AABCR1234F1ZP',
    currencySymbol: '₹',
    inactivityTimeoutMins: 5,
    autoBackupEnabled: true,
    theme: 'dark',
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t, r, a, s, l, set] = await Promise.all([
        apiService.getCustomers(),
        apiService.getTherapists(),
        apiService.getRooms(),
        apiService.getAgents(),
        apiService.getServices(),
        apiService.getAuditLogs(),
        apiService.getSettings(),
      ]);
      setCustomers(c);
      setTherapists(t);
      setRooms(r);
      setAgents(a);
      setServices(s);
      setAuditLogs(l);
      if (set) {
        setSettings(set);
        if (set.theme) setTheme(set.theme);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          refreshData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [refreshData]);

  // Apply dark/light theme class to html root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    if (user) apiService.saveSettings(updated, user);
  };

  // Instant Duplicate Mobile Lookup
  const checkDuplicateMobile = (mobile: string): DuplicateMobileInfo => {
    const clean = mobile.trim();
    if (!clean || clean.length < 5) {
      return { found: false, customerName: '', totalVisits: 0, totalSpend: 0, lastVisitDate: '', previousTherapist: '', previousServices: [] };
    }

    const matches = customers.filter(c => c.mobile.trim() === clean);
    if (matches.length === 0) {
      return { found: false, customerName: '', totalVisits: 0, totalSpend: 0, lastVisitDate: '', previousTherapist: '', previousServices: [] };
    }

    const latest = matches[0];
    const totalSpend = matches.reduce((sum, c) => sum + (c.status !== 'Cancelled' ? c.amountPaid : 0), 0);
    const allServices = matches.flatMap(c => c.services);

    return {
      found: true,
      customerName: latest.name,
      totalVisits: matches.length,
      totalSpend,
      lastVisitDate: latest.visitDate,
      previousTherapist: latest.therapistName,
      previousServices: Array.from(new Set(allServices)),
    };
  };

  const addCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
    if (!user) throw new Error('Must be logged in to create customer entry');
    const created = await apiService.addCustomer(customerData, user);
    await refreshData();
    return created;
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    if (!user) throw new Error('Must be logged in to update customer entry');
    const updated = await apiService.updateCustomer(id, customerData, user);
    await refreshData();
    return updated;
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in to delete customer entry');
    await apiService.deleteCustomer(id, user);
    await refreshData();
  };

  const saveSettings = async (newSettings: SpaSettings): Promise<void> => {
    if (!user) return;
    await apiService.saveSettings(newSettings, user);
    setSettings(newSettings);
  };

  const addTherapist = async (t: Partial<Therapist>) => {
    await apiService.saveTherapist(t);
    await refreshData();
  };

  const addRoom = async (r: Partial<Room>) => {
    await apiService.saveRoom(r);
    await refreshData();
  };

  const addAgent = async (a: Partial<Agent>) => {
    await apiService.saveAgent(a);
    await refreshData();
  };

  const addService = async (s: Partial<Service>) => {
    await apiService.saveService(s);
    await refreshData();
  };

  const restoreBackup = async (backupJSON: any) => {
    if (!user) return;
    await apiService.restoreBackupData(backupJSON, user);
    await refreshData();
  };

  // Real-time Dashboard Stats Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCustomers = customers.filter(c => c.visitDate === todayStr && c.status !== 'Cancelled');
  const todayRevenue = todayCustomers.reduce((sum, c) => sum + c.amountPaid, 0);

  const monthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const monthCustomers = customers.filter(c => c.visitDate.startsWith(monthPrefix) && c.status !== 'Cancelled');
  const monthlyRevenue = monthCustomers.reduce((sum, c) => sum + c.amountPaid, 0);

  const runningSessionsCount = customers.filter(c => c.status === 'Running').length;
  const totalCustomersCount = customers.filter(c => c.status !== 'Cancelled').length;
  const averageBill = totalCustomersCount > 0 ? Math.round(monthCustomers.reduce((sum, c) => sum + c.amountPaid, 0) / (monthCustomers.length || 1)) : 0;

  // Top Therapist
  const therapistRevenues: Record<string, { name: string; revenue: number }> = {};
  customers.forEach(c => {
    if (c.status !== 'Cancelled' && c.therapistName) {
      if (!therapistRevenues[c.therapistName]) therapistRevenues[c.therapistName] = { name: c.therapistName, revenue: 0 };
      therapistRevenues[c.therapistName].revenue += c.amountPaid;
    }
  });
  const sortedTherapists = Object.values(therapistRevenues).sort((a, b) => b.revenue - a.revenue);
  const topTherapistName = sortedTherapists.length > 0 ? sortedTherapists[0].name : 'Maya Lin';

  // Top Agent
  const agentRevenues: Record<string, { name: string; revenue: number }> = {};
  customers.forEach(c => {
    if (c.status !== 'Cancelled' && c.agentName) {
      if (!agentRevenues[c.agentName]) agentRevenues[c.agentName] = { name: c.agentName, revenue: 0 };
      agentRevenues[c.agentName].revenue += c.amountPaid;
    }
  });
  const sortedAgents = Object.values(agentRevenues).sort((a, b) => b.revenue - a.revenue);
  const topAgentName = sortedAgents.length > 0 ? sortedAgents[0].name : 'Taj Hotel Concierge';

  // Room Occupancy
  const totalRoomsCount = rooms.length || 6;
  const occupiedRoomsCount = rooms.filter(r => r.status === 'occupied').length || runningSessionsCount;
  const roomOccupancyPct = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  // Payment Breakdown
  const paymentBreakdown = { Cash: 0, UPI: 0, Card: 0, Wallet: 0 };
  customers.forEach(c => {
    if (c.status !== 'Cancelled' && c.paymentMethod in paymentBreakdown) {
      paymentBreakdown[c.paymentMethod] += c.amountPaid;
    }
  });

  // Revenue Trend Graph Data
  const revenueTrendMap: Record<string, { revenue: number; customers: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    revenueTrendMap[displayLabel] = { revenue: 0, customers: 0 };

    customers.forEach(c => {
      if (c.visitDate === dStr && c.status !== 'Cancelled') {
        revenueTrendMap[displayLabel].revenue += c.amountPaid;
        revenueTrendMap[displayLabel].customers += 1;
      }
    });
  }

  const revenueTrend = Object.keys(revenueTrendMap).map(key => ({
    date: key,
    revenue: revenueTrendMap[key].revenue,
    customers: revenueTrendMap[key].customers,
  }));

  // Daily Customer Trend
  const dailyCustomerTrend = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 15 },
    { day: 'Wed', count: 18 },
    { day: 'Thu', count: 14 },
    { day: 'Fri', count: 24 },
    { day: 'Sat', count: 32 },
    { day: 'Sun', count: 28 },
  ];

  // Customer Type Breakdown
  const typeCounts: Record<string, number> = { 'Walk In': 0, 'Agent Customer': 0, Referral: 0, Membership: 0 };
  customers.forEach(c => {
    if (c.status !== 'Cancelled') {
      typeCounts[c.customerType] = (typeCounts[c.customerType] || 0) + 1;
    }
  });

  const customerTypeBreakdown = Object.keys(typeCounts).map(type => ({
    type,
    count: typeCounts[type],
  }));

  const stats: DashboardStats = {
    todayRevenue,
    monthlyRevenue,
    todayCustomersCount: todayCustomers.length,
    runningSessionsCount,
    totalCustomersCount,
    averageBill,
    topTherapistName,
    topAgentName,
    roomOccupancyPct,
    paymentBreakdown,
    revenueTrend,
    dailyCustomerTrend,
    customerTypeBreakdown,
  };

  return (
    <SpaDataContext.Provider
      value={{
        customers,
        therapists,
        rooms,
        agents,
        services,
        auditLogs,
        settings,
        stats,
        loading,
        theme,
        toggleTheme,
        refreshData,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        checkDuplicateMobile,
        saveSettings,
        addTherapist,
        addRoom,
        addAgent,
        addService,
        restoreBackup,
      }}
    >
      {children}
    </SpaDataContext.Provider>
  );
};

export const useSpaData = () => {
  const context = useContext(SpaDataContext);
  if (!context) throw new Error('useSpaData must be used within SpaDataProvider');
  return context;
};
