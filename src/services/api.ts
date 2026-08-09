import { User, Customer, Therapist, Room, Agent, Service, AuditLog, SpaSettings } from '../types';
import { supabase, isSupabaseConfigured, isDevMode, uploadCustomerPhoto } from '../supabaseClient';

const API_BASE = '/api';

const defaultSettings: SpaSettings = {
  spaName: 'Relaxio Spa & Wellness',
  tagline: 'Luxury Rejuvenation & Holistic Care',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  currencySymbol: '₹',
  inactivityTimeoutMins: 5,
  autoBackupEnabled: true,
  theme: 'dark',
};

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
  const defaultUsers: User[] = [
    {
      id: 'b903dfd9-2199-4494-93e9-74a86fae2488',
      name: 'Pankaj Verma',
      email: 'verpankaj2025@gmail.com',
      phone: '',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
  ];
  if (!getStorage(STORAGE_KEYS.USERS, null)) setStorage(STORAGE_KEYS.USERS, defaultUsers);
  if (!getStorage(STORAGE_KEYS.CUSTOMERS, null)) setStorage(STORAGE_KEYS.CUSTOMERS, []);
  if (!getStorage(STORAGE_KEYS.THERAPISTS, null)) setStorage(STORAGE_KEYS.THERAPISTS, []);
  if (!getStorage(STORAGE_KEYS.ROOMS, null)) setStorage(STORAGE_KEYS.ROOMS, []);
  if (!getStorage(STORAGE_KEYS.AGENTS, null)) setStorage(STORAGE_KEYS.AGENTS, []);
  if (!getStorage(STORAGE_KEYS.SERVICES, null)) setStorage(STORAGE_KEYS.SERVICES, []);
  if (!getStorage(STORAGE_KEYS.AUDIT_LOGS, null)) setStorage(STORAGE_KEYS.AUDIT_LOGS, []);
  if (!getStorage(STORAGE_KEYS.SETTINGS, null)) setStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
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

export interface SystemAuthStatus {
  profileExists: boolean;
  authUserExists: boolean;
  status: 'READY' | 'UNINITIALIZED' | 'AUTH_MISSING';
  email?: string;
}

export const apiService = {
  // Comprehensive status check verifying BOTH Auth user existence AND Profile existence
  async checkSystemAuthStatus(): Promise<SystemAuthStatus> {
    if (!isSupabaseConfigured) {
      const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
      const hasSuperAdmin = users.some(u => u.role === 'super_admin');
      return {
        profileExists: hasSuperAdmin,
        authUserExists: hasSuperAdmin,
        status: hasSuperAdmin ? 'READY' : 'UNINITIALIZED',
      };
    }

    try {
      // 1. Check if profile exists in profiles or users table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'super_admin')
        .limit(1);

      const { data: userData } = await supabase
        .from('users')
        .select('id, email, role_id')
        .or('role_id.eq.super_admin,email.eq.verpankaj2025@gmail.com')
        .limit(1);

      const profile = (profileData && profileData[0]) || (userData && userData[0]);

      if (!profile) {
        // Probe Supabase Auth directly for Super Admin email
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email: 'verpankaj2025@gmail.com',
            options: { shouldCreateUser: false },
          });

          if (!error || error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
            return {
              profileExists: true,
              authUserExists: true,
              status: 'READY',
              email: 'verpankaj2025@gmail.com',
            };
          }
        } catch {}

        // Fallback to checking storage
        const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
        const hasSuper = users.some(u => u.role === 'super_admin' || u.email?.toLowerCase().trim() === 'verpankaj2025@gmail.com');
        if (hasSuper) {
          return {
            profileExists: true,
            authUserExists: true,
            status: 'READY',
            email: 'verpankaj2025@gmail.com',
          };
        }

        return {
          profileExists: false,
          authUserExists: false,
          status: 'UNINITIALIZED',
        };
      }

      const email = profile.email || 'verpankaj2025@gmail.com';

      // 2. Profile exists. Now verify if Supabase Auth user exists for this email
      let authUserExists = false;

      // Check if profile ID is a valid Auth UUID created via Supabase Auth (not default fallback seed ID)
      if (profile.id && profile.id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' && !profile.id.startsWith('sa-')) {
        authUserExists = true;
      } else {
        // Probe if user exists in Supabase Auth via signInWithOtp with shouldCreateUser: false
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          });

          if (!error || error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
            authUserExists = true;
          } else if (
            error.message?.toLowerCase().includes('not found') ||
            error.message?.toLowerCase().includes('invalid') ||
            error.message?.toLowerCase().includes('not allowed') ||
            error.message?.toLowerCase().includes('signup')
          ) {
            authUserExists = false;
          } else {
            authUserExists = false;
          }
        } catch {
          authUserExists = false;
        }
      }

      if (authUserExists) {
        return {
          profileExists: true,
          authUserExists: true,
          status: 'READY',
          email,
        };
      } else {
        return {
          profileExists: true,
          authUserExists: false,
          status: 'AUTH_MISSING',
          email,
        };
      }
    } catch (err) {
      console.warn('[CHECK SYSTEM AUTH STATUS WARN]', err);
      return {
        profileExists: true,
        authUserExists: true,
        status: 'READY',
      };
    }
  },

  // Check if any Super Admin account exists in the system
  async checkHasSuperAdmin(): Promise<boolean> {
    const res = await this.checkSystemAuthStatus();
    return res.profileExists;
  },

  // One-time initialization of Super Admin
  async initializeSuperAdmin(data: { name: string; email: string; password: string }): Promise<{ success: boolean; message: string }> {
    const hasSuper = await this.checkHasSuperAdmin();
    if (hasSuper) {
      throw new Error('Super Admin setup is permanently disabled because a Super Admin account already exists.');
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const name = data.name.trim();

    if (isSupabaseConfigured) {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            name: name,
            role: 'super_admin',
          },
        },
      });

      if (authErr) {
        console.warn('[SUPER ADMIN INIT AUTH INFO]', authErr.message || authErr);
        if (authErr.message?.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase email rate limit exceeded. If the account was already created, please sign in directly on the login screen.');
        }
        if (authErr.message?.toLowerCase().includes('already registered') || authErr.message?.toLowerCase().includes('already exists')) {
          throw new Error('An account with this email is already registered in Supabase. Please sign in directly.');
        }
        throw new Error(authErr.message || 'Failed to create Super Admin in Supabase Auth.');
      }

      const authUser = authData.user;
      if (!authUser) {
        throw new Error('Failed to create Super Admin account in Supabase Auth.');
      }

      // 2. Insert into profiles table
      try {
        await supabase.from('profiles').upsert([
          {
            id: authUser.id,
            email: cleanEmail,
            full_name: name,
            role: 'super_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'id' });
      } catch (err) {
        console.warn('[PROFILES INSERT WARN]', err);
      }

      // 3. Insert into users table
      try {
        await supabase.from('users').upsert([
          {
            id: authUser.id,
            name: name,
            email: cleanEmail,
            phone: '',
            role_id: 'super_admin',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'id' });
      } catch (err) {
        console.warn('[USERS INSERT WARN]', err);
      }

      // Sign out immediately so user is NOT auto-logged in
      await supabase.auth.signOut();

      const requiresEmailConfirmation = !authData.session;
      const successMsg = requiresEmailConfirmation
        ? 'Super Admin created successfully. Please verify your email before signing in.'
        : 'Super Admin created successfully. Please sign in.';

      return {
        success: true,
        message: successMsg,
      };
    } else {
      // Local fallback
      const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
      const newSuperAdmin: User = {
        id: `sa-${Date.now()}`,
        name: name,
        email: cleanEmail,
        phone: '',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      users.unshift(newSuperAdmin);
      setStorage(STORAGE_KEYS.USERS, users);

      return {
        success: true,
        message: 'Super Admin created successfully. Please sign in.',
      };
    }
  },

  // Auth Login (Strict Authentication Only)
  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    if (isSupabaseConfigured) {
      let authUser: any = null;
      let authErr: any = null;

      const identifierClean = identifier.trim();

      console.log('[LOGIN EMAIL]', identifierClean);

      // Step 1: FIRST authenticate using Supabase Auth signInWithPassword
      if (identifierClean.includes('@')) {
        const res = await supabase.auth.signInWithPassword({
          email: identifierClean,
          password,
        });
        authUser = res.data?.user;
        authErr = res.error;
      } else {
        const res = await supabase.auth.signInWithPassword({
          phone: identifierClean,
          password,
        });
        authUser = res.data?.user;
        authErr = res.error;
      }

      if (authErr) {
        console.log('[AUTH ERROR]', authErr.message);
        throw new Error(authErr.message || 'Invalid login credentials');
      }

      if (!authUser) {
        console.warn('[AUTH INFO] No user object returned from Supabase Auth');
        throw new Error('User not found');
      }

      console.log('[AUTH RESPONSE]', authUser.id);

      // Step 2: AFTER successful authentication, fetch or ensure profile
      let fetchedUser: User | null = null;
      if (authUser.email?.toLowerCase().trim() === 'verpankaj2025@gmail.com') {
        fetchedUser = await this.ensureSuperAdminProfile(authUser);
        console.log('[PROFILE LOOKUP] Super Admin profile ensured:', fetchedUser);
      } else {
        const { data: userRow, error: profileErr } = await supabase
          .from('users')
          .select('*')
          .or(`id.eq.${authUser.id},email.eq.${authUser.email}`)
          .maybeSingle();

        if (profileErr) {
          console.warn('[PROFILE LOOKUP WARN] Error querying users table:', profileErr);
        }

        if (userRow) {
          fetchedUser = mapSupabaseUser(userRow);
          console.log('[PROFILE LOOKUP] Profile found in users table:', fetchedUser);
        } else {
          console.log('[PROFILE LOOKUP] No database row found; constructing profile from auth metadata');
          fetchedUser = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || identifier,
            phone: authUser.phone || '',
            role: (authUser.user_metadata?.role as any) || 'staff',
            status: 'active',
            createdAt: authUser.created_at,
            lastLogin: new Date().toISOString(),
          };
        }
      }

      // Step 3: Structured Role Lookup Log
      console.log('[ROLE LOOKUP]', { userId: fetchedUser.id, role: fetchedUser.role, email: fetchedUser.email });

      // Step 4: Check if account is suspended
      if (fetchedUser.status === 'suspended') {
        console.warn('[AUTH ERROR] User account is suspended:', fetchedUser.id);
        await supabase.auth.signOut();
        throw new Error('Account suspended');
      }

      const session = { user: fetchedUser, token: `sb-token-${fetchedUser.id}` };
      setStorage(STORAGE_KEYS.SESSION, session);
      return session;
    }

    // Local Fallback if Supabase is not configured
    const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier);
    if (!user) throw new Error('User not found');
    if (user.status === 'suspended') throw new Error('Account suspended');
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
          .neq('status', 'Deleted')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapSupabaseCustomer);
          setStorage(STORAGE_KEYS.CUSTOMERS, mapped);
          return mapped;
        }
        if (error) {
          console.warn('Supabase getCustomers info:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getCustomers warn:', err);
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

    return getStorage(STORAGE_KEYS.CUSTOMERS, []);
  },

  // Add Customer
  async addCustomer(customerData: Partial<Customer>, createdBy: User): Promise<Customer> {
    if (!createdBy || createdBy.status === 'suspended') {
      throw new Error('Access denied: User account is suspended or invalid.');
    }

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
          try {
            await logSupabaseAudit(
              createdBy.id,
              createdBy.name,
              createdBy.role,
              'CREATE_CUSTOMER',
              'customer',
              newCust.id,
              `Created invoice ${newCust.invoiceNumber} for ${newCust.name} (${newCust.mobile})`
            );
          } catch (auditErr: any) {
            await supabase.from('customers').delete().eq('id', newCust.id);
            throw new Error(`Audit log entry failed. Customer creation rolled back: ${auditErr?.message || 'Unknown error'}`);
          }
          return newCust;
        }
      } catch (err: any) {
        if (err.message?.includes('Audit log entry failed')) throw err;
        console.warn('Supabase addCustomer info:', err.message || err);
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
      invoiceNumber: customerData.invoiceNumber || `RLX-2026-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`,
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
    if (!updatedBy || updatedBy.status === 'suspended') {
      throw new Error('Access denied: User account is suspended or invalid.');
    }

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
      } catch (err: any) {
        console.warn('Supabase updateCustomer info:', err.message || err);
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

  // Soft Delete Customer
  async deleteCustomer(id: string, user: User): Promise<void> {
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      throw new Error('Access denied: Only Administrators can soft-delete customer records.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('customers')
          .update({ status: 'Deleted', updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          await logSupabaseAudit(
            user.id,
            user.name,
            user.role,
            'SOFT_DELETE_CUSTOMER',
            'customer',
            id,
            `Soft-deleted customer record ID ${id}`
          );
          return;
        }
      } catch (err: any) {
        console.warn('Supabase deleteCustomer info:', err.message || err);
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
          .neq('status', 'Deleted')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(mapSupabaseCustomer);
        }
      } catch (err: any) {
        console.warn('Supabase searchByMobile info:', err.message || err);
      }
    }

    const customers: Customer[] = getStorage(STORAGE_KEYS.CUSTOMERS, []);
    return customers.filter(c => c.mobile.trim() === mobile.trim() && c.status !== 'Deleted');
  },

  // Ensure Super Admin Profile exists in Supabase profiles & users table
  async ensureSuperAdminProfile(authUser?: any): Promise<User> {
    const superAdminEmail = authUser?.email || 'verpankaj2025@gmail.com';
    const userId = authUser?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const name = authUser?.user_metadata?.name || 'Super Admin';

    if (isSupabaseConfigured && authUser) {
      try {
        // Upsert into profiles table
        await supabase.from('profiles').upsert([
          {
            id: userId,
            email: superAdminEmail,
            full_name: name,
            role: 'super_admin',
            is_active: true,
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'id' });

        // Upsert into users table
        await supabase.from('users').upsert([
          {
            id: userId,
            name: name,
            email: superAdminEmail,
            phone: authUser?.phone || '',
            role_id: 'super_admin',
            status: 'active',
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'id' });
      } catch (err) {
        console.error('Error auto-syncing Super Admin profile:', err);
      }
    }

    const superAdminUser: User = {
      id: userId,
      name: name,
      email: superAdminEmail,
      phone: authUser?.phone || '',
      role: 'super_admin',
      status: 'active',
      createdAt: authUser?.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    return superAdminUser;
  },

  // Users Management
  async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(mapSupabaseUser);
        }
        if (error) {
          console.error('Supabase getUsers error:', error.message);
        }
      } catch (err) {
        console.error('Supabase getUsers error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) return await res.json();
    } catch {}

    return getStorage(STORAGE_KEYS.USERS, []);
  },

  async createUser(userData: Partial<User> & { password?: string }, requester: User): Promise<User> {
    if (requester.role !== 'super_admin' && userData.role === 'admin') {
      throw new Error('Only Super Admin can manage or create Admin accounts.');
    }
    if (requester.role === 'staff') {
      throw new Error('Staff accounts do not have permission to create users.');
    }

    const cleanEmail = (userData.email || '').toLowerCase().trim();
    const password = userData.password || 'Relaxio@123';

    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentSession = sessionData?.session;

        // 1. Create in Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: userData.name,
              phone: userData.phone || '',
              role: userData.role || 'staff',
            },
          },
        });

        if (authErr) {
          console.warn('Supabase Auth signUp notice:', authErr.message);
        }

        // Restore current session if signUp changed active session
        if (currentSession && authData?.session) {
          await supabase.auth.setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
          });
        }

        const authUserId = authData?.user?.id || crypto.randomUUID();

        // 2. Insert into users table
        const { data: userRow, error: userErr } = await supabase
          .from('users')
          .upsert([
            {
              id: authUserId,
              name: userData.name,
              email: cleanEmail,
              phone: userData.phone || '',
              role_id: userData.role || 'staff',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ], { onConflict: 'id' })
          .select()
          .single();

        if (userErr) {
          console.error('Supabase users insert error:', userErr);
          throw new Error(`Failed to create user: ${userErr.message}`);
        }

        // 3. Sync to profiles table
        try {
          await supabase.from('profiles').upsert([
            {
              id: authUserId,
              email: cleanEmail,
              full_name: userData.name,
              role: userData.role || 'staff',
              is_active: true,
              updated_at: new Date().toISOString(),
            },
          ], { onConflict: 'id' });
        } catch (pErr) {
          console.warn('Profiles upsert warning:', pErr);
        }

        await logSupabaseAudit(requester.id, requester.name, requester.role, 'CREATE_USER', 'user', authUserId, `Provisioned ${userData.role || 'staff'} account for ${userData.name}`);

        return mapSupabaseUser(userRow);
      } catch (err: any) {
        console.error('Supabase createUser error:', err);
        throw new Error(err.message || 'Failed to provision user in Supabase');
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'Staff User',
      email: cleanEmail,
      phone: userData.phone || '',
      role: userData.role || 'staff',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
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
        const { data, error } = await supabase
          .from('users')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);

        const updated = mapSupabaseUser(data);
        await supabase.from('profiles').update({ is_active: status === 'active', updated_at: new Date().toISOString() }).eq('id', id);
        await logSupabaseAudit(requester.id, requester.name, requester.role, 'UPDATE_USER', 'user', id, `Updated account status to ${status}`);
        return updated;
      } catch (err: any) {
        console.error('Supabase toggleUserStatus error:', err);
        throw new Error(err.message || 'Failed to update user status in Supabase');
      }
    }

    const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = status;
      user.updatedAt = new Date().toISOString();
      setStorage(STORAGE_KEYS.USERS, users);
      return user;
    }
    throw new Error('User not found');
  },

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw new Error(error.message);
      return { success: true, message: `Password reset email dispatched to ${email}` };
    }
    return { success: true, message: `Password reset instructions sent to ${email}` };
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
        const { error: err1 } = await supabase.from('users').delete().eq('id', id);
        if (err1) console.error('Supabase users delete error:', err1);
        const { error: err2 } = await supabase.from('profiles').delete().eq('id', id);
        if (err2) console.error('Supabase profiles delete error:', err2);

        await logSupabaseAudit(requester.id, requester.name, requester.role, 'DELETE_USER', 'user', id, `Deleted user account ID ${id}`);
        return;
      } catch (err: any) {
        console.error('Supabase deleteUser error:', err);
        throw new Error(err.message || 'Failed to delete user in Supabase');
      }
    }

    const users: User[] = getStorage(STORAGE_KEYS.USERS, []);
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

    return getStorage(STORAGE_KEYS.THERAPISTS, []);
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

    const list: Therapist[] = getStorage(STORAGE_KEYS.THERAPISTS, []);
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

    return getStorage(STORAGE_KEYS.ROOMS, []);
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

    const list: Room[] = getStorage(STORAGE_KEYS.ROOMS, []);
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

    return getStorage(STORAGE_KEYS.AGENTS, []);
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

    const list: Agent[] = getStorage(STORAGE_KEYS.AGENTS, []);
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

    return getStorage(STORAGE_KEYS.SERVICES, []);
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

    const list: Service[] = getStorage(STORAGE_KEYS.SERVICES, []);
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

    return getStorage(STORAGE_KEYS.AUDIT_LOGS, []);
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

    return getStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
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
