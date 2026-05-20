'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const role = session?.user?.role || null;

  const value = {
    session,
    status,
    role,
    isAdmin: role === 'ADMIN',
    isAdminAssistant: role === 'ADMIN_ASSISTANT',
    isAuthenticated: status === 'authenticated',
    canEdit: role === 'ADMIN' || role === 'ADMIN_ASSISTANT',
    canDelete: role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}