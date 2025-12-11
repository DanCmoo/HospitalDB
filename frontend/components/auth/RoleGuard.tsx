'use client';

import { useAuth } from '@/lib/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, hasRole } = useAuth();

  if (!user || !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
