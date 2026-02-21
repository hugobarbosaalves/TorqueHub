/**
 * Backoffice DashboardPage — workshop overview with order stats.
 * @module BackofficeDashboardPage
 */

import { type ReactNode, useEffect, useState } from 'react';
import type { ServiceOrderDTO } from '@torquehub/contracts';
import { statusConfig } from '@torquehub/design-tokens';
import { listOrders } from '../../services/backofficeService';
import { getUser } from '../../services/authService';

/** Backoffice dashboard with order counts by status. */
export function DashboardPage(): ReactNode {
  const user = getUser();
  const [orders, setOrders] = useState<ServiceOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /** Counts orders by status. */
  function countByStatus(status: string): number {
    return orders.filter((order) => order.status === status).length;
  }

  if (error) return <div className="page-error">{error}</div>;
  if (loading) return <div className="spinner" />;

  const statusKeys = Object.keys(statusConfig);

  return (
    <div className="page">
      <h1 className="page-title">Bem-vindo, {user?.name ?? 'Usuário'}</h1>
      <p className="page-subtitle">Resumo da sua oficina</p>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-icon">📋</span>
          <div className="metric-info">
            <span className="metric-value">{orders.length}</span>
            <span className="metric-label">Total de OS</span>
          </div>
        </div>
        {statusKeys.map((status) => {
          const config = statusConfig[status];
          if (!config) return null;
          const count = countByStatus(status.toLowerCase());
          if (count === 0) return null;
          return (
            <div key={status} className="metric-card">
              <span className="metric-dot" style={{ backgroundColor: config.color }} />
              <div className="metric-info">
                <span className="metric-value">{count}</span>
                <span className="metric-label">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
