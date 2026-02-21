/**
 * Backoffice ReportsPage — reports and analytics for the workshop.
 * @module BackofficeReportsPage
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { listOrders } from '../../services/backofficeService';
import { statusConfig } from '@torquehub/design-tokens';

/** Shape of an order from the API. */
interface Order {
  readonly id: string;
  readonly status: string;
  readonly totalAmount: number;
  readonly createdAt: string;
}

/** Status summary for the reports. */
interface StatusSummary {
  readonly status: string;
  readonly count: number;
  readonly total: number;
}

/** Reports page with order statistics. */
export function ReportsPage(): ReactNode {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadOrders();
  }, []);

  /** Carrega ordens de serviço. */
  async function loadOrders(): Promise<void> {
    try {
      const data = (await listOrders()) as Order[];
      setOrders(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  /** Agrupa ordens por status. */
  function getStatusSummary(): StatusSummary[] {
    const map = new Map<string, StatusSummary>();
    for (const order of orders) {
      const existing = map.get(order.status);
      if (existing) {
        map.set(order.status, {
          status: order.status,
          count: existing.count + 1,
          total: existing.total + order.totalAmount,
        });
      } else {
        map.set(order.status, {
          status: order.status,
          count: 1,
          total: order.totalAmount,
        });
      }
    }
    return Array.from(map.values());
  }

  /** Calcula o faturamento total. */
  function getTotalRevenue(): number {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  if (loading) {
    return (
      <div className="page">
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  const summaries = getStatusSummary();

  return (
    <div className="page">
      <h1 className="page-title">Relatórios</h1>
      <p className="page-subtitle">Visão geral de desempenho da oficina</p>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-value">{orders.length}</span>
          <span className="metric-label">Total de OS</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">
            {getTotalRevenue().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="metric-label">Faturamento Total</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">
            {orders.length > 0
              ? (getTotalRevenue() / orders.length).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 0,00'}
          </span>
          <span className="metric-label">Ticket Médio</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-body">
          <h2 className="section-title">Ordens por Status</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => {
                const config = statusConfig[summary.status];
                return (
                  <tr key={summary.status}>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: config?.color
                            ? `${config.color}1A`
                            : 'var(--color-neutral-100)',
                          color: config?.color ?? 'var(--color-neutral-600)',
                        }}
                      >
                        {config?.label ?? summary.status}
                      </span>
                    </td>
                    <td>{summary.count}</td>
                    <td>
                      {summary.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
