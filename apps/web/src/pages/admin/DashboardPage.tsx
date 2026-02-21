/**
 * Admin DashboardPage — platform-wide metrics overview.
 * @module AdminDashboardPage
 */

import { type ReactNode, useEffect, useState } from 'react';
import type { PlatformMetricsDTO } from '@torquehub/contracts';
import { getMetrics } from '../../services/adminService';

/** Metric card display configuration. */
const METRIC_CARDS = [
  { key: 'totalWorkshops', label: 'Oficinas', icon: '🏪' },
  { key: 'totalUsers', label: 'Usuários', icon: '👤' },
  { key: 'totalServiceOrders', label: 'Ordens de Serviço', icon: '📋' },
  { key: 'totalCustomers', label: 'Clientes', icon: '👥' },
] as const;

/** Admin dashboard page with platform metrics. */
export function DashboardPage(): ReactNode {
  const [metrics, setMetrics] = useState<PlatformMetricsDTO | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro');
      });
  }, []);

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  if (!metrics) {
    return <div className="spinner" />;
  }

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Visão geral da plataforma TorqueHub</p>

      <div className="metrics-grid">
        {METRIC_CARDS.map((card) => (
          <div key={card.key} className="metric-card">
            <span className="metric-icon">{card.icon}</span>
            <div className="metric-info">
              <span className="metric-value">{metrics[card.key]}</span>
              <span className="metric-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
