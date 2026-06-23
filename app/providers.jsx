'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../components/AuthContext';

export default function Providers({ children }) {
  const pathname = usePathname();
  const skipAuthRoutes = new Set(['/map', '/simple-map', '/AQStories']);
  const shouldSkipAuthProvider = skipAuthRoutes.has(pathname);

  if (shouldSkipAuthProvider) {
    return children;
  }

  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
