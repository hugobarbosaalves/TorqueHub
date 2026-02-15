/**
 * App — Root component with routing for the TorqueHub client portal.
 * @module App
 */

import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { OrderPage } from './pages/OrderPage';

/** Shared header rendered on every page. */
function Header(): ReactNode {
  return (
    <header className="header">
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
        <h1>🔧 TorqueHub</h1>
      </Link>
      <p>Portal do Cliente — Acompanhe seu serviço</p>
    </header>
  );
}

/** Shared footer rendered on every page. */
function Footer(): ReactNode {
  return <footer className="footer">TorqueHub — Gestão de Manutenção Automotiva</footer>;
}

/** Root application component with browser router. */
export function App(): ReactNode {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:token" element={<OrderPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
