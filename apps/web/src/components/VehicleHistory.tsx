/**
 * VehicleHistory — Shows past service orders for the same vehicle.
 * Provides a timeline-like view of all services.
 * Uses design tokens from @torquehub/design-tokens.
 * @module VehicleHistory
 */

import { useEffect, useState, type ReactNode } from 'react';
import { getVehicleHistory, type ServiceOrder } from '../services/api';
import { statusConfig } from '@torquehub/design-tokens';

interface VehicleHistoryProps {
  readonly token: string;
  readonly currentOrderId: string;
}

/** Formats centavos as BRL currency. */
function currency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Renders the vehicle service history timeline. */
export function VehicleHistory({ token, currentOrderId }: VehicleHistoryProps): ReactNode {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicleHistory(token)
      .then((data) => { setOrders(data); })
      .catch(() => { setOrders([]); })
      .finally(() => { setLoading(false); });
  }, [token]);

  if (loading) return <div className="spinner" />;
  if (orders.length <= 1) return null;

  return (
    <div className="card">
      <div className="card-body">
        <p className="section-title">📜 Histórico do Veículo</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {orders.map((order) => {
            const isCurrent = order.id === currentOrderId;
            const info = statusConfig[order.status];
            return (
              <div
                key={order.id}
                style={{
                  padding: 'var(--space-6) var(--space-8)', borderRadius: 'var(--radius-md)',
                  border: isCurrent ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: isCurrent ? '#eff6ff' : 'var(--color-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                      {info?.icon ?? '❓'} {order.description}
                      {isCurrent && <span style={{ color: 'var(--color-accent)', fontSize: 'var(--font-size-xs)', marginLeft: 8 }}>● atual</span>}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {info?.label ?? order.status}
                    </p>
                  </div>
                  <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-base)', whiteSpace: 'nowrap' }}>{currency(order.totalAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
