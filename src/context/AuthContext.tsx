import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';
import { initialUsers } from '../data/mockInitialData';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  logout: (reason?: string) => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  canExport: boolean;
  canManageUsers: boolean;
  canDeleteCustomer: boolean;
  lastActivity: number;
  inactivityWarning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [inactivityWarning, setInactivityWarning] = useState<boolean>(false);

  // Sync session with Supabase Auth or local storage
  const syncUserFromAuth = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const email = authUser.email || '';
    if (email.toLowerCase().trim() === 'verpankaj2025@gmail.com') {
      // Auto-recreate or update Super Admin profile in database
      const superAdminUser = await apiService.ensureSuperAdminProfile(authUser);
      setUser(superAdminUser);
      return;
    }

    // Lookup user in Supabase or local storage
    try {
      const users = await apiService.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.id === authUser.id);
      if (existing) {
        setUser(existing);
      } else {
        const newUser: User = {
          id: authUser.id,
          name: authUser.user_metadata?.name || email.split('@')[0] || 'User',
          email,
          phone: authUser.phone || '',
          role: 'staff',
          status: 'active',
          createdAt: authUser.created_at || new Date().toISOString(),
        };
        setUser(newUser);
      }
    } catch {
      setUser({
        id: authUser.id,
        name: email.split('@')[0] || 'User',
        email,
        phone: '',
        role: 'staff',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted && data.session?.user) {
            await syncUserFromAuth(data.session.user);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Supabase getSession error:', err);
        }
      }

      // Check saved fallback session
      try {
        const savedSession = localStorage.getItem('relaxio_session_v1');
        if (savedSession && mounted) {
          const parsed = JSON.parse(savedSession);
          if (parsed.user?.email === 'verpankaj2025@gmail.com') {
            const superAdmin = await apiService.ensureSuperAdminProfile(parsed.user);
            setUser(superAdmin);
          } else {
            setUser(parsed.user);
          }
        } else if (mounted) {
          // Default initial session for Super Admin verpankaj2025@gmail.com
          const defaultSuperAdmin: User = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            name: 'Super Admin (Pankaj)',
            email: 'verpankaj2025@gmail.com',
            phone: '9876543210',
            role: 'super_admin',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          setUser(defaultSuperAdmin);
        }
      } catch {
        if (mounted) setUser(initialUsers[0]);
      }
      if (mounted) setLoading(false);
    }

    initAuth();

    // Listen to Supabase Auth State Changes for automatic session refresh
    let authListener: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) await syncUserFromAuth(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Activity tracking for auto-logout
  const resetInactivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    if (inactivityWarning) setInactivityWarning(false);
  }, [inactivityWarning]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    const handleEvent = () => resetInactivityTimer();

    events.forEach(evt => window.addEventListener(evt, handleEvent));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleEvent));
    };
  }, [resetInactivityTimer]);

  // Inactivity Auto-logout check
  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const inactiveMs = now - lastActivity;
      const timeoutMs = 5 * 60 * 1000; // 5 minutes

      if (inactiveMs >= timeoutMs - 30000 && !inactivityWarning) {
        setInactivityWarning(true);
      }

      if (inactiveMs >= timeoutMs) {
        logout('Logged out automatically due to 5 minutes of inactivity');
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [user, lastActivity, inactivityWarning]);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    const cleanId = identifier.trim();

    try {
      if (isSupabaseConfigured && cleanId.includes('@')) {
        // Try Supabase Auth sign-in
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password,
        });

        if (!authErr && authData.user) {
          await syncUserFromAuth(authData.user);
          setLastActivity(Date.now());
          setInactivityWarning(false);
          setLoading(false);
          return;
        }

        // Auto create/sign up Super Admin if account does not exist in Supabase Auth yet
        if (cleanId.toLowerCase() === 'verpankaj2025@gmail.com') {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email: cleanId,
            password,
            options: { data: { name: 'Super Admin', role: 'super_admin' } },
          });

          if (!signUpErr && signUpData.user) {
            await syncUserFromAuth(signUpData.user);
            setLastActivity(Date.now());
            setInactivityWarning(false);
            setLoading(false);
            return;
          }
        }
      }

      // Check local user database or fallback
      const { user: loggedInUser } = await apiService.login(cleanId, password);
      
      if (cleanId.toLowerCase() === 'verpankaj2025@gmail.com' || loggedInUser.email === 'verpankaj2025@gmail.com') {
        const superAdmin = await apiService.ensureSuperAdminProfile();
        setUser(superAdmin);
      } else {
        setUser(loggedInUser);
      }
      
      setLastActivity(Date.now());
      setInactivityWarning(false);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const loginAsRole = (role: UserRole) => {
    if (role === 'super_admin') {
      const superAdmin: User = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Super Admin (Pankaj)',
        email: 'verpankaj2025@gmail.com',
        phone: '9876543210',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUser(superAdmin);
      try {
        localStorage.setItem('relaxio_session_v1', JSON.stringify({ user: superAdmin, token: 'sb-super-admin-token' }));
      } catch {}
    } else {
      const target = initialUsers.find(u => u.role === role) || initialUsers[0];
      setUser(target);
      try {
        localStorage.setItem('relaxio_session_v1', JSON.stringify({ user: target, token: `demo-token-${target.id}` }));
      } catch {}
    }
    setLastActivity(Date.now());
    setInactivityWarning(false);
  };

  const logout = async (reason?: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    try {
      localStorage.removeItem('relaxio_session_v1');
    } catch {}
    if (reason) {
      alert(reason);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin' || user?.email?.toLowerCase().trim() === 'verpankaj2025@gmail.com';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isStaff = user?.role === 'staff' || isAdmin;

  const canExport = isSuperAdmin;
  const canManageUsers = isSuperAdmin;
  const canDeleteCustomer = isSuperAdmin || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        resetPassword,
        loginAsRole,
        logout,
        isSuperAdmin,
        isAdmin,
        isStaff,
        canExport,
        canManageUsers,
        canDeleteCustomer,
        lastActivity,
        inactivityWarning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
