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
  const syncUserFromAuth = async (authUser: any): Promise<User> => {
    if (!authUser) {
      setUser(null);
      throw new Error('Invalid mobile/email or account suspended');
    }

    const email = authUser.email || '';
    if (email.toLowerCase().trim() === 'verpankaj2025@gmail.com') {
      // Auto-recreate or update Super Admin profile in database
      const superAdminUser = await apiService.ensureSuperAdminProfile(authUser);
      setUser(superAdminUser);
      return superAdminUser;
    }

    // Lookup user in Supabase or local storage AFTER authentication
    try {
      const users = await apiService.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.id === authUser.id);
      if (existing) {
        if (existing.status === 'suspended') {
          await supabase.auth.signOut();
          setUser(null);
          throw new Error('Invalid mobile/email or account suspended');
        }
        setUser(existing);
        return existing;
      }
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
      return newUser;
    } catch (err: any) {
      if (err.message === 'Invalid mobile/email or account suspended') {
        throw err;
      }
      const fallbackUser: User = {
        id: authUser.id,
        name: email.split('@')[0] || 'User',
        email,
        phone: '',
        role: 'staff',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      return fallbackUser;
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
          } else if (parsed.user) {
            setUser(parsed.user);
          } else {
            setUser(null);
          }
        } else if (mounted) {
          // No saved session: require authentication
          setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
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
      const { user: loggedInUser } = await apiService.login(cleanId, password);
      setUser(loggedInUser);
      setLastActivity(Date.now());
      setInactivityWarning(false);
    } catch (err: any) {
      throw new Error(err.message || 'Invalid login credentials');
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

  const loginAsRole = (_role: UserRole) => {
    console.warn('Demo login bypass is disabled. Please authenticate using valid credentials.');
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
