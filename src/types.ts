export type UserRole = 'super_admin' | 'admin' | 'staff';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Wallet';

export type CustomerType = 'Walk In' | 'Agent Customer' | 'Referral' | 'Membership';

export type CustomerStatus = 'Completed' | 'Running' | 'Cancelled';

export interface Customer {
  id: string;
  invoiceNumber: string; // e.g. RLX-2026-1001
  name: string;
  mobile: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  visitDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutTime: string; // HH:mm
  roomId: string;
  roomNumber: string;
  therapistId: string;
  therapistName: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  customerType: CustomerType;
  agentId?: string;
  agentName?: string;
  services: string[]; // service names or IDs
  remarks?: string;
  photoUrl?: string;
  status: CustomerStatus;
  createdBy: string; // user name or ID
  createdAt: string;
  updatedAt: string;
}

export interface Therapist {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  status: 'active' | 'on_leave';
  totalSessions: number;
  totalRevenue: number;
  rating: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: 'Standard' | 'VIP Deluxe' | 'Couples Suite' | 'Ayurvedic Room';
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  commissionPct: number;
  totalReferrals: number;
  totalRevenueGenerated: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMins: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE_CUSTOMER' | 'UPDATE_CUSTOMER' | 'DELETE_CUSTOMER' | 'LOGIN' | 'LOGOUT' | 'EXPORT_DATA' | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'RESTORE_BACKUP' | 'UPDATE_SETTINGS';
  targetEntity: string;
  targetId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SpaSettings {
  spaName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  currencySymbol: string;
  inactivityTimeoutMins: number; // e.g. 5
  autoBackupEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  todayCustomersCount: number;
  runningSessionsCount: number;
  totalCustomersCount: number;
  averageBill: number;
  topTherapistName: string;
  topAgentName: string;
  roomOccupancyPct: number;
  paymentBreakdown: {
    Cash: number;
    UPI: number;
    Card: number;
    Wallet: number;
  };
  revenueTrend: { date: string; revenue: number; customers: number }[];
  dailyCustomerTrend: { day: string; count: number }[];
  customerTypeBreakdown: { type: string; count: number }[];
}
