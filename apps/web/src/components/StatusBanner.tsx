/**
 * StatusBanner — Visual status indicator for a service order.
 * Displays the current status with color-coded background and icon.
 * Uses design tokens from @torquehub/design-tokens.
 * @module StatusBanner
 */

import type { ReactNode } from 'react';
import { statusConfig } from '@torquehub/design-tokens';

interface StatusBannerProps {
  readonly status: string;
}

/** Renders a full-width colored banner representing the order status. */
export function StatusBanner({ status }: StatusBannerProps): ReactNode {
  const info = statusConfig[status] ?? { label: status, color: '#94a3b8', icon: '❓' };

  return (
    <div style={{ background: info.color, color: '#fff', padding: 'var(--space-8) var(--space-12)', textAlign: 'center' }}>
      <span style={{ fontSize: 'var(--font-size-5xl)' }}>{info.icon}</span>
      <h3 style={{ margin: '4px 0 0', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>{info.label}</h3>
    </div>
  );
}
