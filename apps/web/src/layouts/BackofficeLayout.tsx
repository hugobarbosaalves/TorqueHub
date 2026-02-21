/**
 * BackofficeLayout — shell layout for WORKSHOP_OWNER pages.
 * Provides sidebar navigation and top bar with user/workshop info.
 * @module BackofficeLayout
 */

import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

/** Navigation items for the backoffice sidebar — WORKSHOP_OWNER sees all, MECHANIC sees limited. */
interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: string;
  readonly ownerOnly?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/backoffice', label: 'Dashboard', icon: '📊' },
  { to: '/backoffice/orders', label: 'Ordens de Serviço', icon: '📋' },
  { to: '/backoffice/customers', label: 'Clientes', icon: '👥', ownerOnly: true },
  { to: '/backoffice/mechanics', label: 'Equipe', icon: '🔧', ownerOnly: true },
  { to: '/backoffice/reports', label: 'Relatórios', icon: '📈', ownerOnly: true },
  { to: '/backoffice/settings', label: 'Configurações', icon: '⚙️' },
];

/** Backoffice layout with sidebar + content area. */
export function BackofficeLayout(): ReactNode {
  const user = getUser();
  const navigate = useNavigate();

  /** Handles logout click. */
  function handleLogout(): void {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <aside className="sidebar sidebar-backoffice">
        <div className="sidebar-brand">
          <h2>🔧 TorqueHub</h2>
          <span className="sidebar-badge backoffice">Oficina</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter((item) => !item.ownerOnly || user?.role === 'WORKSHOP_OWNER').map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/backoffice'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.name ?? 'Usuário'}</span>
            <span className="sidebar-user-role">
              {user?.role === 'MECHANIC' ? 'Mecânico' : 'Dono da oficina'}
            </span>
          </div>
          <button className="sidebar-logout" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
