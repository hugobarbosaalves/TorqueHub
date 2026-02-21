/**
 * App — Root component with routing for the TorqueHub web portal.
 * Supports public pages, admin portal, and backoffice portal.
 * @module App
 */

import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { OrderPage } from './pages/OrderPage';
import { LoginPage } from './pages/LoginPage';
import { RoleGuard } from './guards/RoleGuard';
import { AdminLayout } from './layouts/AdminLayout';
import { BackofficeLayout } from './layouts/BackofficeLayout';
import { isAuthenticated, getUser } from './services/authService';

/* Admin pages */
import { DashboardPage as AdminDashboard } from './pages/admin/DashboardPage';
import { WorkshopsPage } from './pages/admin/WorkshopsPage';
import { WorkshopDetailPage } from './pages/admin/WorkshopDetailPage';
import { SettingsPage as AdminSettings } from './pages/admin/SettingsPage';

/* Backoffice pages */
import { DashboardPage as BackofficeDashboard } from './pages/backoffice/DashboardPage';
import { OrdersPage } from './pages/backoffice/OrdersPage';
import { CustomersPage } from './pages/backoffice/CustomersPage';
import { MechanicsPage } from './pages/backoffice/MechanicsPage';
import { ReportsPage } from './pages/backoffice/ReportsPage';
import { SettingsPage as BackofficeSettings } from './pages/backoffice/SettingsPage';

/** Shared header for the public portal. */
function Header(): ReactNode {
  return (
    <header className="header">
      <Link to="/portal" style={{ color: 'var(--color-card)', textDecoration: 'none' }}>
        <h1>🔧 TorqueHub</h1>
      </Link>
      <p>Portal do Cliente — Acompanhe seu serviço</p>
    </header>
  );
}

/** Shared footer for the public portal. */
function Footer(): ReactNode {
  return <footer className="footer">TorqueHub — Gestão de Manutenção Automotiva</footer>;
}

/** Public layout wrapper with header and footer. */
function PublicLayout({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

/** Smart redirect: if authenticated, go to role home. Otherwise, go to public home. */
function SmartLogin(): ReactNode {
  if (isAuthenticated()) {
    const user = getUser();
    const roleHome: Record<string, string> = {
      PLATFORM_ADMIN: '/admin',
      WORKSHOP_OWNER: '/backoffice',
      MECHANIC: '/backoffice',
    };
    return <Navigate to={roleHome[user?.role ?? ''] ?? '/login'} replace />;
  }
  return <LoginPage />;
}

/** Root application component with browser router. */
export function App(): ReactNode {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz — SmartLogin: se autenticado, redireciona por role. Senão, login. */}
        <Route path="/" element={<SmartLogin />} />

        {/* Login explícito */}
        <Route path="/login" element={<SmartLogin />} />

        {/* Portal público do cliente — consulta de ordem de serviço */}
        <Route
          path="/portal"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/order/:token"
          element={
            <PublicLayout>
              <OrderPage />
            </PublicLayout>
          }
        />

        {/* Admin portal — PLATFORM_ADMIN only */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['PLATFORM_ADMIN']}>
              <AdminLayout />
            </RoleGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="workshops" element={<WorkshopsPage />} />
          <Route path="workshops/:id" element={<WorkshopDetailPage />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Backoffice portal — WORKSHOP_OWNER (and MECHANIC with limited nav) */}
        <Route
          path="/backoffice"
          element={
            <RoleGuard allowedRoles={['WORKSHOP_OWNER', 'MECHANIC']}>
              <BackofficeLayout />
            </RoleGuard>
          }
        >
          <Route index element={<BackofficeDashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="mechanics" element={<MechanicsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<BackofficeSettings />} />
        </Route>

        {/* Catch-all — redireciona para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
