/**
 * RoleGuard — protects routes based on JWT user role.
 * Redirects unauthenticated users to /login and unauthorized users to their portal.
 * @module RoleGuard
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@torquehub/contracts';
import { isAuthenticated, getUser } from '../services/authService';

/** Redirect target by role when accessing wrong portal. */
const ROLE_HOME: Record<UserRole, string> = {
  PLATFORM_ADMIN: '/admin',
  WORKSHOP_OWNER: '/backoffice',
  MECHANIC: '/backoffice',
};

/** Props for the RoleGuard component. */
interface RoleGuardProps {
  readonly allowedRoles: readonly UserRole[];
  readonly children: ReactNode;
}

/** Renders children only if the authenticated user has an allowed role. */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps): ReactNode {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return children;
}
