import { User, Customer, Therapist, Room, Agent, Service, AuditLog, SpaSettings } from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Rajesh Sharma (Super Admin)',
    email: 'owner@relaxiospa.com',
    phone: '9876543210',
    role: 'super_admin',
    status: 'active',
    createdAt: '2026-01-01T10:00:00Z',
    lastLogin: '2026-08-06T08:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'Priya Verma (Admin)',
    email: 'admin@relaxiospa.com',
    phone: '9812345678',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-15T11:00:00Z',
    lastLogin: '2026-08-06T09:15:00Z',
  },
  {
    id: 'usr-3',
    name: 'Anish Kumar (Staff)',
    email: 'desk@relaxiospa.com',
    phone: '9898989898',
    role: 'staff',
    status: 'active',
    createdAt: '2026-02-01T09:00:00Z',
    lastLogin: '2026-08-06T07:45:00Z',
  },
];

export const initialTherapists: Therapist[] = [];

export const initialRooms: Room[] = [];

export const initialAgents: Agent[] = [];

export const initialServices: Service[] = [];

export const initialCustomers: Customer[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const initialSettings: SpaSettings = {
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
};

