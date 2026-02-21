/**
 * Auth service — handles login, token storage, and JWT decoding.
 * Used by both admin and backoffice portals.
 * @module authService
 */

import type { UserRole } from '@torquehub/contracts';

const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:3333';
const TOKEN_KEY = 'torquehub_token';
const USER_KEY = 'torquehub_user';

/** Decoded user info stored after login. */
export interface AuthUser {
  readonly id: string;
  readonly workshopId: string | null;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly mustChangePassword?: boolean;
}

/** Login response shape from the API. */
interface LoginApiResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser & { createdAt: string };
  };
  meta?: { error?: string };
}

/** Performs login and stores token + user in localStorage. */
export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = (await res.json()) as LoginApiResponse;
  if (!res.ok || !json.success) {
    throw new Error(json.meta?.error ?? 'Falha na autenticação');
  }

  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.data.user));

  return json.data.user;
}

/** Returns the stored JWT token, or null if not authenticated. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Returns the stored user info, or null if not authenticated. */
export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Returns true if the user is authenticated. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/** Clears auth data and redirects to login. */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  globalThis.location.href = '/login';
}

/** Builds headers with Authorization bearer token. */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

/** Authenticated fetch wrapper — auto-adds auth headers, handles 401. */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401) {
    logout();
  }

  return res;
}

/** Changes the authenticated user's password. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await authFetch('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: AuthUser;
    meta?: { error?: string };
  };
  if (!res.ok || !json.success) {
    throw new Error(json.meta?.error ?? 'Falha ao alterar senha');
  }

  if (json.data) {
    localStorage.setItem(USER_KEY, JSON.stringify(json.data));
  }
}
