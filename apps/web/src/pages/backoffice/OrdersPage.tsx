/**
 * Backoffice OrdersPage — list service orders with status badges.
 * @module BackofficeOrdersPage
 */

import { type ReactNode, useEffect, useState } from 'react';
import type { ServiceOrderDTO } from '@torquehub/contracts';
import { statusConfig } from '@torquehub/design-tokens';
import { listOrders } from '../../services/backofficeService';

/** Formats cents to BRL currency string. */
function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Gets status display config. */
function getStatusInfo(status: string): { label: string; color: string } {
  const key = status.toUpperCase();
  return statusConfig[key] ?? { label: status, color: 'var(--color-neutral-400)' };
}

/** Orders listing page. */
export function OrdersPage(): ReactNode {
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

  if (error) return <div className="page-error">{error}</div>;
  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <h1 className="page-title">Ordens de Serviço</h1>
      <p className="page-subtitle">{orders.length} ordens encontradas</p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Cliente</th>
              <th>Veículo</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <tr key={order.id}>
                  <td className="td-bold">{order.description}</td>
                  <td>{order.customerName ?? '—'}</td>
                  <td>{order.vehiclePlate ?? '—'}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="td-empty">
                  Nenhuma ordem de serviço encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
