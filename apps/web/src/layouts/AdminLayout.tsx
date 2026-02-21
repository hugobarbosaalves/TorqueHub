/**
 * AdminLayout — shell layout for PLATFORM_ADMIN pages.
 * Provides sidebar navigation, mobile hamburger menu, and user info.
 * @module AdminLayout
 */

import { type ReactNode, useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

/** Navigation items for the admin sidebar. */
const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/workshops', label: 'Oficinas', icon: '🏪' },
  { to: '/admin/settings', label: 'Configurações', icon: '⚙️' },
] as const;

/** Admin layout with sidebar + mobile hamburger + content area. */
export function AdminLayout(): ReactNode {
  const user = getUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  /** Toggles mobile sidebar. */
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  /** Closes mobile sidebar. */
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  /** Handles logout click. */
  function handleLogout(): void {
    logout();
    void navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" type="button" onClick={toggleMenu} aria-label="Menu">
          ☰
        </button>
        <span className="mobile-topbar-title">🔧 TorqueHub</span>
        <span className="mobile-topbar-badge">Admin</span>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${menuOpen ? ' visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
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
              onClick={closeMenu}
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
