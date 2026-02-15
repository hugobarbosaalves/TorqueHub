/**
 * VehicleHistory — Shows past service orders for the same vehicle.
 * Provides a timeline-like view of all services.
 * @module VehicleHistory
 */

import { useEffect, useState, type ReactNode } from 'react';
import { getVehicleHistory, type ServiceOrder } from '../services/api';

const STATUS_ICON: Record<string, string> = {
  DRAFT: '📝', PENDING_APPROVAL: '⏳', APPROVED: '👍',
  IN_PROGRESS: '🔧', COMPLETED: '✅', CANCELLED: '❌',
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho', PENDING_APPROVAL: 'Aguardando Aprovação', APPROVED: 'Aprovada',
  IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelada',
};

interface VehicleHistoryProps {
  token: string;
  currentOrderId: string;
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => {
            const isCurrent = order.id === currentOrderId;
            return (
              <div
                key={order.id}
                style={{
                  padding: '12px 16px', borderRadius: 8,
                  border: isCurrent ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: isCurrent ? '#eff6ff' : 'var(--color-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>
                      {STATUS_ICON[order.status] ?? '❓'} {order.description}
                      {isCurrent && <span style={{ color: 'var(--color-accent)', fontSize: 12, marginLeft: 8 }}>● atual</span>}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {STATUS_LABEL[order.status] ?? order.status}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{currency(order.totalAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
