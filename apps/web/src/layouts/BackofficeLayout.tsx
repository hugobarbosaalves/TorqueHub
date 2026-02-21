/**
 * BackofficeLayout — shell layout for WORKSHOP_OWNER pages.
 * Provides sidebar navigation, mobile hamburger menu, and user/workshop info.
 * @module BackofficeLayout
 */

import { type ReactNode, useState, useCallback } from 'react';
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

/** Backoffice layout with sidebar + mobile hamburger + content area. */
export function BackofficeLayout(): ReactNode {
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
    navigate('/login', { replace: true });
  }

  /** Filters nav items based on user role. */
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.ownerOnly || user?.role === 'WORKSHOP_OWNER',
  );

  return (
    <div className="layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" type="button" onClick={toggleMenu} aria-label="Menu">
          ☰
        </button>
        <span className="mobile-topbar-title">🔧 TorqueHub</span>
        <span className="mobile-topbar-badge backoffice">Oficina</span>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${menuOpen ? ' visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside className={`sidebar sidebar-backoffice${menuOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <h2>🔧 TorqueHub</h2>
          <span className="sidebar-badge backoffice">Oficina</span>
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/backoffice'}
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
