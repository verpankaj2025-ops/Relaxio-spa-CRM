import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';
import { initialUsers } from '../data/mockInitialData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  logout: (reason?: string) => void;
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

  // Load session on startup
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('relaxio_session_v1');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
      } else {
        setUser(initialUsers[0]);
      }
    } catch {
      setUser(initialUsers[0]);
    }
    setLoading(false);
  }, []);

  // Update activity timestamp on user interaction
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

  // Inactivity Auto-logout check interval (Default 5 minutes)
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
    try {
      const { user: loggedInUser } = await apiService.login(identifier, password);
      setUser(loggedInUser);
      setLastActivity(Date.now());
      setInactivityWarning(false);
    } finally {
      setLoading(false);
    }
  };

  const loginAsRole = (role: UserRole) => {
    const target = initialUsers.find(u => u.role === role) || initialUsers[0];
    setUser(target);
    try {
      localStorage.setItem('relaxio_session_v1', JSON.stringify({ user: target, token: `demo-token-${target.id}` }));
    } catch {}
    setLastActivity(Date.now());
    setInactivityWarning(false);
  };

  const logout = (reason?: string) => {
    setUser(null);
    try {
      localStorage.removeItem('relaxio_session_v1');
    } catch {}
    if (reason) {
      alert(reason);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isStaff = user?.role === 'staff' || isAdmin;

  const canExport = isSuperAdmin; // Only Super Admin can export data per rules
  const canManageUsers = isSuperAdmin;
  const canDeleteCustomer = isSuperAdmin || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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
