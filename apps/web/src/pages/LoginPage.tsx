/**
 * LoginPage — unified login for all user roles.
 * After successful login, redirects based on JWT role.
 * @module LoginPage
 */

import { type ReactNode, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@torquehub/contracts';
import { login } from '../services/authService';

/** Redirect target after login, by role. */
const ROLE_REDIRECT: Record<UserRole, string> = {
  PLATFORM_ADMIN: '/admin',
  WORKSHOP_OWNER: '/backoffice',
  MECHANIC: '/backoffice',
};

/** Login page component. */
export function LoginPage(): ReactNode {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Handles form submit. */
  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const redirect = ROLE_REDIRECT[user.role] ?? '/';
      if (user.mustChangePassword) {
        void navigate(`${redirect}/settings`, {
          replace: true,
          state: { forcePasswordChange: true },
        });
      } else {
        void navigate(redirect, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🔧 TorqueHub</h1>
          <p>Acesse sua conta</p>
        </div>

        <form
          className="login-form"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          {error && <div className="login-error">{error}</div>}

          <label className="login-label">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="login-label">
            <span>Senha</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
