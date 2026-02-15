/**
 * StatusBanner — Visual status indicator for a service order.
 * Displays the current status with color-coded background and icon.
 * @module StatusBanner
 */

import type { ReactNode } from 'react';

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  DRAFT: { label: 'Rascunho', color: '#94a3b8', icon: '📝' },
  PENDING_APPROVAL: { label: 'Aguardando Sua Aprovação', color: '#f59e0b', icon: '⏳' },
  APPROVED: { label: 'Aprovada', color: '#3b82f6', icon: '👍' },
  IN_PROGRESS: { label: 'Em Andamento', color: '#8b5cf6', icon: '🔧' },
  COMPLETED: { label: 'Serviço Concluído', color: '#22c55e', icon: '✅' },
  CANCELLED: { label: 'Cancelada', color: '#ef4444', icon: '❌' },
};

interface StatusBannerProps {
  status: string;
}

/** Renders a full-width colored banner representing the order status. */
export function StatusBanner({ status }: StatusBannerProps): ReactNode {
  const info = STATUS_MAP[status] ?? { label: status, color: '#94a3b8', icon: '❓' };

  return (
    <div style={{ background: info.color, color: '#fff', padding: '16px 24px', textAlign: 'center' }}>
      <span style={{ fontSize: 32 }}>{info.icon}</span>
      <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>{info.label}</h3>
    </div>
  );
}
