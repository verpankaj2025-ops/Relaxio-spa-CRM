import { User, Customer, Therapist, Room, Agent, Service, AuditLog, SpaSettings } from '../types';
import { initialUsers, initialCustomers, initialTherapists, initialRooms, initialAgents, initialServices, initialAuditLogs, initialSettings } from '../data/mockInitialData';
import { supabase, isSupabaseConfigured, isDevMode, uploadCustomerPhoto } from '../supabaseClient';

const API_BASE = '/api';

// LocalStorage Keys Fallback
const STORAGE_KEYS = {
  USERS: 'relaxio_users_v1',
  CUSTOMERS: 'relaxio_customers_v1',
  THERAPISTS: 'relaxio_therapists_v1',
  ROOMS: 'relaxio_rooms_v1',
  AGENTS: 'relaxio_agents_v1',
  SERVICES: 'relaxio_services_v1',
  AUDIT_LOGS: 'relaxio_audit_logs_v1',
  SETTINGS: 'relaxio_settings_v1',
  SESSION: 'relaxio_session_v1',
};

// Safe LocalStorage Helpers
function getStorage<T>(key: string, fallback: T): T {
  if (!isSupabaseConfigured && !isDevMode) {
    return fallback;
  }
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (!isSupabaseConfigured && !isDevMode) {
    console.error('Data modification blocked: Supabase environment variables are missing in production.');
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Initialize Local Storage fallback
export function initLocalStorageFallback() {
  if (!isSupabaseConfigured && !isDevMode) {
    return;
  }
  if (!getStorage(STORAGE_KEYS.USERS, null)) setStorage(STORAGE_KEYS.USERS, initialUsers);
  if (!getStorage(STORAGE_KEYS.CUSTOMERS, null)) setStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  if (!getStorage(STORAGE_KEYS.THERAPISTS, null)) setStorage(STORAGE_KEYS.THERAPISTS, initialTherapists);
  if (!getStorage(STORAGE_KEYS.ROOMS, null)) setStorage(STORAGE_KEYS.ROOMS, initialRooms);
  if (!getStorage(STORAGE_KEYS.AGENTS, null)) setStorage(STORAGE_KEYS.AGENTS, initialAgents);
  if (!getStorage(STORAGE_KEYS.SERVICES, null)) setStorage(STORAGE_KEYS.SERVICES, initialServices);
  if (!getStorage(STORAGE_KEYS.AUDIT_LOGS, null)) setStorage(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  if (!getStorage(STORAGE_KEYS.SETTINGS, null)) setStorage(STORAGE_KEYS.SETTINGS, initialSettings);
}

initLocalStorageFallback();

// --- SUPABASE CONVERTERS ---

function mapSupabaseCustomer(row: any): Customer {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number || '',
    name: row.name || 'Guest',
    mobile: row.mobile || '',
    gender: row.gender || 'Male',
    age: row.age || 30,
    visitDate: row.visit_date || new Date().toISOString().split('T')[0],
    checkInTime: row.check_in_time ? String(row.check_in_time).slice(0, 5) : '10:00',
    checkOutTime: row.check_out_time ? String(row.check_out_time).slice(0, 5) : '11:00',
    roomId: row.room_id || '',
    roomNumber: row.room_number || '',
    therapistId: row.therapist_id || '',
    therapistName: row.therapist_name || '',
    amountPaid: Number(row.amount_paid) || 0,
    paymentMethod: row.payment_method || 'Cash',
    customerType: row.customer_type || 'Walk In',
    agentId: row.agent_id || undefined,
    agentName: row.agent_name || undefined,
    services: Array.isArray(row.services) ? row.services : typeof row.services === 'string' ? JSON.parse(row.services) : [],
    remarks: row.remarks || '',
    photoUrl: row.photo_url || undefined,
    status: row.status || 'Running',
    createdBy: row.created_by || 'System',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function customerToSupabaseRow(c: Partial<Customer>, createdBy?: User) {
  return {
    name: c.name,
    mobile: c.mobile,
    gender: c.gender,
    age: c.age,
    visit_date: c.visitDate || new Date().toISOString().split('T')[0],
    check_in_time: c.checkInTime || '10:00',
    check_out_time: c.checkOutTime || null,
    room_id: c.roomId || null,
    room_number: c.roomNumber || null,
    therapist_id: c.therapistId || null,
    therapist_name: c.therapistName || null,
    amount_paid: Number(c.amountPaid) || 0,
    payment_method: c.paymentMethod || 'Cash',
    customer_type: c.customerType || 'Walk In',
    agent_id: c.agentId || null,
    agent_name: c.agentName || null,
    services: c.services || [],
    remarks: c.remarks || '',
    photo_url: c.photoUrl || null,
    status: c.status || 'Running',
    created_by: createdBy ? createdBy.name : (c.createdBy || 'Staff'),
    updated_at: new Date().toISOString(),
  };
}

function mapSupabaseUser(row: any): User {
  const isSuperAdminEmail = row.email?.toLowerCase().trim() === 'verpankaj2025@gmail.com';
  return {
    id: row.id,
    name: row.name || row.full_name || (isSuperAdminEmail ? 'Super Admin' : 'Staff User'),
    email: row.email,
    phone: row.phone || '',
    role: isSuperAdminEmail ? 'super_admin' : (row.role_id || row.role || 'staff'),
    status: row.status || (row.is_active === false ? 'suspended' : 'active'),
    createdAt: row.created_at || new Date().toISOString(),
    lastLogin: row.last_login || undefined,
  };
}

function mapSupabaseTherapist(row: any): Therapist {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    specialization: row.specialization || 'General',
    status: row.status || 'active',
    totalSessions: Number(row.total_sessions) || 0,
    totalRevenue: Number(row.total_revenue) || 0,
    rating: Number(row.rating) || 4.8,
  };
}

function mapSupabaseRoom(row: any): Room {
  return {
    id: row.id,
    roomNumber: row.room_number,
    type: row.type,
    status: row.status,
  };
}

function mapSupabaseAgent(row: any): Agent {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    commissionPct: Number(row.commission_pct) || 10,
    totalReferrals: Number(row.total_referrals) || 0,
    totalRevenueGenerated: Number(row.total_revenue_generated) || 0,
    status: row.status || 'active',
  };
}

function mapSupabaseService(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price) || 0,
    durationMins: Number(row.duration_mins) || 60,
  };
}

function mapSupabaseAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id || 'sys',
    userName: row.user_name || 'System',
    userRole: row.user_role || 'staff',
    action: row.action,
    targetEntity: row.target_entity,
    targetId: row.target_id || undefined,
    details: row.details || '',
    ipAddress: row.ip_address || '127.0.0.1',
    timestamp: row.created_at || new Date().toISOString(),
  };
}

// Helper to log audit in Supabase
async function logSupabaseAudit(userId: string, userName: string, userRole: string, action: string, targetEntity: string, targetId: string | undefined, details: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('audit_logs').insert([{
      user_id: userId && userId.startsWith('usr-') ? null : userId || null,
      user_name: userName || 'System',
      user_role: userRole || 'staff',
      action,
      target_entity: targetEntity,
      target_id: targetId || null,
      details,
      ip_address: '127.0.0.1',
    }]);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export const apiService = {
  // Auth Login
  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    if (isSupabaseConfigured) {
      try {
        // First try finding user in Supabase users table
        const { data: userRows, error } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${identifier},phone.eq.${identifier}`)
          .eq('status', 'active');

        if (!error && userRows && userRows.length > 0) {
          const matched = userRows[0];
          const user = mapSupabaseUser(matched);
          
          // Update last_login
          await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', matched.id);
          await logSupabaseAudit(user.id, user.name, user.role, 'LOGIN', 'system', undefined, `User logged in via ${user.email}`);

          const session = { user, token: `sb-token-${user.id}` };
          setStorage(STORAGE_KEYS.SESSION, session);
          return session;
        }

        // Try Supabase Auth sign-in if email format
        if (identifier.includes('@')) {
          const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: identifier,
            password,
          });
          if (!authErr && authData.user) {
            const user: User = {
              id: authData.user.id,
              name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
              email: authData.user.email || identifier,
              phone: authData.user.phone || '',
              role: (authData.user.user_metadata?.role as any) || 'staff',
              status: 'active',
              createdAt: authData.user.created_at,
              lastLogin: new Date().toISOString(),
            };
            const session = { user, token: authData.session?.access_token || `sb-token-${user.id}` };
            setStorage(STORAGE_KEYS.SESSION, session);
            return session;
          }
        }
      } catch (err) {
        console.error('Supabase Auth error:', err);
      }
    }

    // Server or Local Fallback
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setStorage(STORAGE_KEYS.SESSION, data);
        return data;
      }
    } catch {}

    const users: User[] = getStorage(STORAGE_KEYS.USERS, initialUsers);
    const user = users.find(u => (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier) && u.status === 'active');
    if (!user) throw new Error('Invalid mobile/email or account suspended');
    const data = { user, token: `local-token-${user.id}` };
    setStorage(STORAGE_KEYS.SESSION, data);
    return data;
  },

  // Get Customers
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapSupabaseCustomer);
          setStorage(STORAGE_KEYS.CUSTOMERS, mapped);
          return mapped;
        }
      } catch (err) {
        console.error('Supabase fetch error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/customers`);
      if (res.ok) {
        const data = await res.json();
        setStorage(STORAGE_KEYS.CUSTOMERS, data);
        return data;
      }
    } catch {}

    return getStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  },

  // Add Customer
  async addCustomer(customerData: Partial<Customer>, createdBy: User): Promise<Customer> {
    if (isSupabaseConfigured) {
      try {
        const row = customerToSupabaseRow(customerData, createdBy);
        const { data, error } = await supabase
          .from('customers')
          .insert([row])
          .select()
          .single();

        if (!error && data) {
          const newCust = mapSupabaseCustomer(data);
          await logSupabaseAudit(
            createdBy.id,
            createdBy.name,
            createdBy.role,
            'CREATE_CUSTOMER',
            'customer',
            newCust.id,
            `Created invoice ${newCust.invoiceNumber} for ${newCust.name} (${newCust.mobile})`
          );
          return newCust;
        } else if (error) {
          console.error('Supabase customer insert error:', error.message);
        }
      } catch (err) {
        console.error('Supabase add customer exception:', err);
      }
    }

    // REST Server / Local Fallback
    const payload = {
      ...customerData,
      createdByUserId: createdBy.id,
      createdBy: createdBy.name,
      createdByRole: createdBy.role,
    };

    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newCust = await res.json();
        const current: Customer[] = getStorage(STORAGE_KEYS.CUSTOMERS, []);
        setStorage(STORAGE_KEYS.CUSTOMERS, [newCust, ...current]);
        return newCust;
      }
    } catch {}

    const count = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []).length + 1007;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      invoiceNumber: customerData.invoiceNumber || `RLX-2026-${count}`,
      name: customerData.name || 'Guest',
      mobile: customerData.mobile || '',
      gender: customerData.gender || 'Male',
      age: customerData.age || 30,
      visitDate: customerData.visitDate || new Date().toISOString().split('T')[0],
      checkInTime: customerData.checkInTime || '10:00',
      checkOutTime: customerData.checkOutTime || '11:00',
      roomId: customerData.roomId || 'rm-101',
      roomNumber: customerData.roomNumber || 'Room 101',
      therapistId: customerData.therapistId || 'th-1',
      therapistName: customerData.therapistName || 'Therapist',
      amountPaid: Number(customerData.amountPaid) || 0,
      paymentMethod: customerData.paymentMethod || 'Cash',
      customerType: customerData.customerType || 'Walk In',
      agentId: customerData.agentId,
      agentName: customerData.agentName,
      services: customerData.services || [],
      remarks: customerData.remarks,
      photoUrl: customerData.photoUrl,
      status: customerData.status || 'Running',
      createdBy: createdBy.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current: Customer[] = getStorage(STORAGE_KEYS.CUSTOMERS, []);
    setStorage(STORAGE_KEYS.CUSTOMERS, [newCust, ...current]);
    return newCust;
  },

  // Update Customer
  async updateCustomer(id: string, customerData: Partial<Customer>, updatedBy: User): Promise<Customer> {
    if (isSupabaseConfigured) {
      try {
        const rowUpdates: any = {};
        if (customerData.name !== undefined) rowUpdates.name = customerData.name;
        if (customerData.mobile !== undefined) rowUpdates.mobile = customerData.mobile;
        if (customerData.gender !== undefined) rowUpdates.gender = customerData.gender;
        if (customerData.age !== undefined) rowUpdates.age = customerData.age;
        if (customerData.visitDate !== undefined) rowUpdates.visit_date = customerData.visitDate;
        if (customerData.checkInTime !== undefined) rowUpdates.check_in_time = customerData.checkInTime;
        if (customerData.checkOutTime !== undefined) rowUpdates.check_out_time = customerData.checkOutTime;
        if (customerData.roomId !== undefined) rowUpdates.room_id = customerData.roomId;
        if (customerData.roomNumber !== undefined) rowUpdates.room_number = customerData.roomNumber;
        if (customerData.therapistId !== undefined) rowUpdates.therapist_id = customerData.therapistId;
        if (customerData.therapistName !== undefined) rowUpdates.therapist_name = customerData.therapistName;
        if (customerData.amountPaid !== undefined) rowUpdates.amount_paid = Number(customerData.amountPaid);
        if (customerData.paymentMethod !== undefined) rowUpdates.payment_method = customerData.paymentMethod;
        if (customerData.customerType !== undefined) rowUpdates.customer_type = customerData.customerType;
        if (customerData.agentId !== undefined) rowUpdates.agent_id = customerData.agentId;
        if (customerData.agentName !== undefined) rowUpdates.agent_name = customerData.agentName;
        if (customerData.services !== undefined) rowUpdates.services = customerData.services;
        if (customerData.remarks !== undefined) rowUpdates.remarks = customerData.remarks;
        if (customerData.photoUrl !== undefined) rowUpdates.photo_url = customerData.photoUrl;
        if (customerData.status !== undefined) rowUpdates.status = customerData.status;
        rowUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('customers')
          .update(rowUpdates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated = mapSupabaseCustomer(data);
          await logSupabaseAudit(
            updatedBy.id,
            updatedBy.name,
            updatedBy.role,
            'UPDATE_CUSTOMER',
            'customer',
            id,
            `Updated entry ${updated.invoiceNumber} status to ${updated.status}`
          );
          return updated;
        }
      } catch (err) {
        console.error('Supabase update customer exception:', err);
      }
    }

    const payload = {
      ...customerData,
      updatedByUserId: updatedBy.id,
      updatedBy: updatedBy.name,
      updatedByRole: updatedBy.role,
    };

    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const current: Customer[] = getStorage(STORAGE_KEYS.CUSTOMERS, []);
    const index = current.findIndex(c => c.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...customerData, updatedAt: new Date().toISOString() };
      setStorage(STORAGE_KEYS.CUSTOMERS, current);
      return current[index];
    }
    throw new Error('Customer record not found');
  },

  // Delete Customer
  async deleteCustomer(id: string, user: User): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (!error) {
          await logSupabaseAudit(
            user.id,
            user.name,
            user.role,
            'DELETE_CUSTOMER',
            'customer',
            id,
            `Deleted customer record ID ${id}`
          );
          return;
        }
      } catch (err) {
        console.error('Supabase delete customer error:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/customers/${id}?userRole=${user.role}&userName=${encodeURIComponent(user.name)}&userId=${user.id}`, {
        method: 'DELETE',
      });
    } catch {}

    const current: Customer[] = getStorage(STORAGE_KEYS.CUSTOMERS, []);
    const updated = current.filter(c => c.id !== id);
    setStorage(STORAGE_KEYS.CUSTOMERS, updated);
  },

  // Search Customer By Mobile
  async searchByMobile(mobile: string): Promise<Customer[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('mobile', mobile.trim())
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(mapSupabaseCustomer);
        }
      } catch (err) {
        console.error('Supabase search mobile error:', err);
      }
    }

    const customers: Customer[] = getStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    return customers.filter(c => c.mobile.trim() === mobile.trim());
  },

  // Ensure Super Admin Profile exists in Supabase profiles & users table
  async ensureSuperAdminProfile(authUser?: any): Promise<User> {
    const superAdminEmail = 'verpankaj2025@gmail.com';
    const userId = authUser?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    if (isSupabaseConfigured) {
      try {
        // Upsert into profiles table
        await supabase.from('profiles').upsert([
          {
            id: userId,
            email: superAdminEmail,
            full_name: 'Super Admin',
            role: 'super_admin',
            is_active: true,
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'email' });

        // Upsert into users table
        await supabase.from('users').upsert([
          {
            id: userId,
            name: 'Super Admin (Pankaj)',
            email: superAdminEmail,
            phone: '9876543210',
            role_id: 'super_admin',
            status: 'active',
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'email' });
      } catch (err) {
        console.error('Error auto-syncing Super Admin profile:', err);
      }
    }

    const superAdminUser: User = {
      id: userId,
      name: 'Super Admin (Pankaj)',
      email: superAdminEmail,
      phone: '9876543210',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    return superAdminUser;
  },

  // Users Management
  async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const list = data.map(mapSupabaseUser);
          if (!list.some(u => u.email === 'verpankaj2025@gmail.com')) {
            const superAdmin = await this.ensureSuperAdminProfile();
            list.unshift(superAdmin);
          }
          return list;
        }
      } catch (err) {
        console.error('Supabase getUsers error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) return await res.json();
    } catch {}

    const list: User[] = getStorage(STORAGE_KEYS.USERS, initialUsers);
    if (!list.some(u => u.email === 'verpankaj2025@gmail.com')) {
      list.unshift({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Super Admin (Pankaj)',
        email: 'verpankaj2025@gmail.com',
        phone: '9876543210',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
    return list;
  },

  async createUser(userData: Partial<User>, requester: User): Promise<User> {
    if (requester.role !== 'super_admin' && userData.role === 'admin') {
      throw new Error('Only Super Admin can manage or create Admin accounts.');
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role_id: userData.role || 'staff',
            status: 'active',
          }])
          .select()
          .single();

        if (!error && data) {
          const newUser = mapSupabaseUser(data);
          // Also sync to profiles table
          await supabase.from('profiles').insert([{
            id: data.id,
            email: data.email,
            full_name: data.name,
            role: data.role_id,
            is_active: true,
          }]);
          await logSupabaseAudit(requester.id, requester.name, requester.role, 'CREATE_USER', 'user', newUser.id, `Created ${newUser.role} account for ${newUser.name}`);
          return newUser;
        }
      } catch (err) {
        console.error('Supabase createUser error:', err);
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'Staff User',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'staff',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const users: User[] = getStorage(STORAGE_KEYS.USERS, initialUsers);
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended', requester: User): Promise<User> {
    return this.toggleUserStatus(id, status, requester);
  },

  async toggleUserStatus(id: string, status: 'active' | 'suspended', requester: User): Promise<User> {
    const usersList = await this.getUsers();
    const target = usersList.find(u => u.id === id);

    if (target?.email === 'verpankaj2025@gmail.com' || target?.role === 'super_admin') {
      throw new Error('The Super Admin account is permanent and cannot be modified or suspended.');
    }

    if (requester.role !== 'super_admin' && target?.role === 'admin') {
      throw new Error('Only Super Admin can modify Admin accounts.');
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').update({ status }).eq('id', id).select().single();
        if (!error && data) {
          const updated = mapSupabaseUser(data);
          await supabase.from('profiles').update({ is_active: status === 'active' }).eq('id', id);
          await logSupabaseAudit(requester.id, requester.name, requester.role, 'UPDATE_USER', 'user', id, `Updated account status to ${status}`);
          return updated;
        }
      } catch (err) {
        console.error('Supabase toggleUserStatus error:', err);
      }
    }

    const users: User[] = getStorage(STORAGE_KEYS.USERS, initialUsers);
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = status;
      setStorage(STORAGE_KEYS.USERS, users);
      return user;
    }
    throw new Error('User not found');
  },

  async deleteUser(id: string, requester: User): Promise<void> {
    const usersList = await this.getUsers();
    const target = usersList.find(u => u.id === id);

    if (target?.email === 'verpankaj2025@gmail.com' || target?.role === 'super_admin') {
      throw new Error('The Super Admin account is protected and cannot be deleted.');
    }

    if (requester.role !== 'super_admin' && target?.role === 'admin') {
      throw new Error('Only Super Admin can remove Admin accounts.');
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('users').delete().eq('id', id);
        await supabase.from('profiles').delete().eq('id', id);
        await logSupabaseAudit(requester.id, requester.name, requester.role, 'DELETE_USER', 'user', id, `Deleted user account ID ${id}`);
        return;
      } catch (err) {
        console.error('Supabase deleteUser error:', err);
      }
    }

    const users: User[] = getStorage(STORAGE_KEYS.USERS, initialUsers);
    const filtered = users.filter(u => u.id !== id);
    setStorage(STORAGE_KEYS.USERS, filtered);
  },

  // Therapists
  async getTherapists(): Promise<Therapist[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('therapists').select('*').order('name');
        if (!error && data) return data.map(mapSupabaseTherapist);
      } catch (err) {
        console.error('Supabase getTherapists error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/therapists`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.THERAPISTS, initialTherapists);
  },

  async saveTherapist(t: Partial<Therapist>): Promise<Therapist> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('therapists')
          .insert([{
            name: t.name,
            phone: t.phone,
            specialization: t.specialization,
            status: t.status || 'active',
          }])
          .select()
          .single();
        if (!error && data) return mapSupabaseTherapist(data);
      } catch (err) {
        console.error('Supabase saveTherapist error:', err);
      }
    }

    const list: Therapist[] = getStorage(STORAGE_KEYS.THERAPISTS, initialTherapists);
    const newT: Therapist = { id: `th-${Date.now()}`, name: t.name || 'Therapist', phone: t.phone || '', specialization: t.specialization || 'General', status: 'active', totalSessions: 0, totalRevenue: 0, rating: 5.0 };
    list.push(newT);
    setStorage(STORAGE_KEYS.THERAPISTS, list);
    return newT;
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('rooms').select('*').order('room_number');
        if (!error && data) return data.map(mapSupabaseRoom);
      } catch (err) {
        console.error('Supabase getRooms error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/rooms`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.ROOMS, initialRooms);
  },

  async saveRoom(r: Partial<Room>): Promise<Room> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .insert([{
            room_number: r.roomNumber,
            type: r.type || 'Standard',
            status: r.status || 'available',
          }])
          .select()
          .single();
        if (!error && data) return mapSupabaseRoom(data);
      } catch (err) {
        console.error('Supabase saveRoom error:', err);
      }
    }

    const list: Room[] = getStorage(STORAGE_KEYS.ROOMS, initialRooms);
    const newR: Room = { id: `rm-${Date.now()}`, roomNumber: r.roomNumber || 'Room 107', type: r.type || 'Standard', status: 'available' };
    list.push(newR);
    setStorage(STORAGE_KEYS.ROOMS, list);
    return newR;
  },

  // Agents
  async getAgents(): Promise<Agent[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('agents').select('*').order('name');
        if (!error && data) return data.map(mapSupabaseAgent);
      } catch (err) {
        console.error('Supabase getAgents error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/agents`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.AGENTS, initialAgents);
  },

  async saveAgent(a: Partial<Agent>): Promise<Agent> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('agents')
          .insert([{
            name: a.name,
            phone: a.phone,
            commission_pct: Number(a.commissionPct) || 10,
            status: 'active',
          }])
          .select()
          .single();
        if (!error && data) return mapSupabaseAgent(data);
      } catch (err) {
        console.error('Supabase saveAgent error:', err);
      }
    }

    const list: Agent[] = getStorage(STORAGE_KEYS.AGENTS, initialAgents);
    const newA: Agent = { id: `ag-${Date.now()}`, name: a.name || 'Agent', phone: a.phone || '', commissionPct: a.commissionPct || 10, totalReferrals: 0, totalRevenueGenerated: 0, status: 'active' };
    list.push(newA);
    setStorage(STORAGE_KEYS.AGENTS, list);
    return newA;
  },

  // Services
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').select('*').order('name');
        if (!error && data) return data.map(mapSupabaseService);
      } catch (err) {
        console.error('Supabase getServices error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/services`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.SERVICES, initialServices);
  },

  async saveService(s: Partial<Service>): Promise<Service> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('services')
          .insert([{
            name: s.name,
            category: s.category || 'Therapy',
            price: Number(s.price) || 1000,
            duration_mins: Number(s.durationMins) || 60,
          }])
          .select()
          .single();
        if (!error && data) return mapSupabaseService(data);
      } catch (err) {
        console.error('Supabase saveService error:', err);
      }
    }

    const list: Service[] = getStorage(STORAGE_KEYS.SERVICES, initialServices);
    const newS: Service = { id: `srv-${Date.now()}`, name: s.name || 'Service', category: s.category || 'Therapy', price: Number(s.price) || 1000, durationMins: Number(s.durationMins) || 60 };
    list.push(newS);
    setStorage(STORAGE_KEYS.SERVICES, list);
    return newS;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (!error && data) return data.map(mapSupabaseAuditLog);
      } catch (err) {
        console.error('Supabase getAuditLogs error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/audit-logs`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  },

  // Settings
  async getSettings(): Promise<SpaSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'general').single();
        if (!error && data && data.value) return data.value as SpaSettings;
      } catch (err) {
        console.error('Supabase getSettings error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.SETTINGS, initialSettings);
  },

  async saveSettings(settings: SpaSettings, user: User): Promise<SpaSettings> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('settings').upsert({ key: 'general', value: settings, updated_at: new Date().toISOString() });
        await logSupabaseAudit(user.id, user.name, user.role, 'UPDATE_SETTINGS', 'settings', 'general', 'Updated spa configuration settings');
        return settings;
      } catch (err) {
        console.error('Supabase saveSettings error:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, userId: user.id, userName: user.name, userRole: user.role }),
      });
    } catch {}

    setStorage(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // Export Data & Backup
  async getBackupData(user?: User): Promise<any> {
    return this.exportAllData();
  },

  async exportAllData(): Promise<any> {
    const customers = await this.getCustomers();
    const users = await this.getUsers();
    const therapists = await this.getTherapists();
    const rooms = await this.getRooms();
    const agents = await this.getAgents();
    const services = await this.getServices();
    const auditLogs = await this.getAuditLogs();
    const settings = await this.getSettings();

    return {
      exportTimestamp: new Date().toISOString(),
      version: '1.0',
      users,
      customers,
      therapists,
      rooms,
      agents,
      services,
      auditLogs,
      settings,
    };
  },

  // Restore Backup
  async restoreBackupData(backupData: any, user: User): Promise<void> {
    return this.restoreData(backupData, user);
  },

  async restoreData(backupData: any, user: User): Promise<void> {
    if (isSupabaseConfigured && backupData) {
      try {
        if (backupData.customers && Array.isArray(backupData.customers)) {
          for (const c of backupData.customers) {
            await supabase.from('customers').upsert([customerToSupabaseRow(c, user)]);
          }
        }
        await logSupabaseAudit(user.id, user.name, user.role, 'RESTORE_BACKUP', 'system', 'restore', 'Restored database from snapshot');
      } catch (err) {
        console.error('Supabase restoreData error:', err);
      }
    }

    if (backupData.users) setStorage(STORAGE_KEYS.USERS, backupData.users);
    if (backupData.customers) setStorage(STORAGE_KEYS.CUSTOMERS, backupData.customers);
    if (backupData.therapists) setStorage(STORAGE_KEYS.THERAPISTS, backupData.therapists);
    if (backupData.rooms) setStorage(STORAGE_KEYS.ROOMS, backupData.rooms);
    if (backupData.agents) setStorage(STORAGE_KEYS.AGENTS, backupData.agents);
    if (backupData.services) setStorage(STORAGE_KEYS.SERVICES, backupData.services);
    if (backupData.settings) setStorage(STORAGE_KEYS.SETTINGS, backupData.settings);
  },
};
