/**
 * VehicleHistory — Shows past service orders for the same vehicle.
 * Provides a timeline-like view of all services.
 * Uses design tokens from @torquehub/design-tokens.
 * @module VehicleHistory
 */

import { useEffect, useState, type ReactNode } from 'react';
import { getVehicleHistory, type ServiceOrder } from '../services/api';
import { statusConfig } from '@torquehub/design-tokens';
import { SectionCard } from './SectionCard';
import { currency, formatDateBR } from '../utils/format';

interface VehicleHistoryProps {
  readonly token: string;
  readonly currentOrderId: string;
}

/** Renders the vehicle service history timeline. */
export function VehicleHistory({ token, currentOrderId }: VehicleHistoryProps): ReactNode {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicleHistory(token)
      .then((data) => {
        setOrders(data);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="spinner" />;
  if (orders.length <= 1) return null;

  return (
    <SectionCard icon="📜" title="Histórico do Veículo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {orders.map((order) => {
            const isCurrent = order.id === currentOrderId;
            const info = statusConfig[order.status];
            return (
              <div
                key={order.id}
                style={{
                  padding: 'var(--space-6) var(--space-8)',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                  background: isCurrent ? 'var(--color-info-light, #eff6ff)' : 'var(--color-card)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 'var(--font-weight-semibold)',
                        fontSize: 'var(--font-size-base)',
                      }}
                    >
                      {info?.icon ?? '❓'} {order.description}
                      {isCurrent && (
                        <span
                          style={{
                            color: 'var(--color-accent)',
                            fontSize: 'var(--font-size-xs)',
                            marginLeft: 8,
                          }}
                        >
                          ● atual
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-muted)',
                        marginTop: 2,
                      }}
                    >
                      {formatDateBR(order.createdAt)} ·{' '}
                      {info?.label ?? order.status}
                    </p>
                  </div>
                  <span
                    style={{
                      fontWeight: 'var(--font-weight-bold)',
                      fontSize: 'var(--font-size-base)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currency(order.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
    </SectionCard>
  );
}
