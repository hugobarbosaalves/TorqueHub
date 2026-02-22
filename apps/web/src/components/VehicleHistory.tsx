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
import { ScrollText } from './icons';
import { getStatusIcon } from './statusIcons';

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
    <SectionCard icon={<ScrollText size={20} />} title="Histórico do Veículo">
      <div className="history-list">
        {orders.map((order) => {
          const isCurrent = order.id === currentOrderId;
          const info = statusConfig[order.status];
          const IconComponent = getStatusIcon(info?.icon ?? 'CircleHelp');
          return (
            <div
              key={order.id}
              className={`history-entry${isCurrent ? ' history-entry-current' : ''}`}
            >
              <div className="history-entry-header">
                <div className="history-entry-body">
                  <p className="history-entry-desc">
                    <IconComponent size={14} /> {order.description}
                    {isCurrent && <span className="history-entry-badge">● atual</span>}
                  </p>
                  <p className="history-entry-meta">
                    {formatDateBR(order.createdAt)} · {info?.label ?? order.status}
                  </p>
                </div>
                <span className="history-entry-amount">{currency(order.totalAmount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
