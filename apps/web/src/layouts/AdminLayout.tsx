/**
 * AdminLayout — shell layout for PLATFORM_ADMIN pages.
 * Provides sidebar navigation and top bar with user info.
 * @module AdminLayout
 */

import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

/** Navigation items for the admin sidebar. */
const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/workshops', label: 'Oficinas', icon: '🏪' },
  { to: '/admin/settings', label: 'Configurações', icon: '⚙️' },
] as const;

/** Admin layout with sidebar + content area. */
export function AdminLayout(): ReactNode {
  const user = getUser();
  const navigate = useNavigate();

  /** Handles logout click. */
  function handleLogout(): void {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>🔧 TorqueHub</h2>
          <span className="sidebar-badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.name ?? 'Admin'}</span>
            <span className="sidebar-user-role">Administrador</span>
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
