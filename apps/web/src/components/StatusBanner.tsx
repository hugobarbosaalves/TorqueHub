/**
 * StatusBanner — Visual status indicator for a service order.
 * Displays the current status with color-coded background and icon.
 * Uses design tokens from @torquehub/design-tokens.
 * @module StatusBanner
 */

import type { ReactNode } from 'react';
import { statusConfig } from '@torquehub/design-tokens';
import { getStatusIcon } from './statusIcons';

interface StatusBannerProps {
  readonly status: string;
}

/** Renders a full-width colored banner representing the order status. */
export function StatusBanner({ status }: StatusBannerProps): ReactNode {
  const info = statusConfig[status] ?? { label: status, color: 'var(--color-neutral-400)', icon: 'CircleHelp' };
  const IconComponent = getStatusIcon(info.icon);

  return (
    <div className="status-banner" style={{ backgroundColor: info.color }}>
      <IconComponent size={36} className="status-banner-icon" />
      <h3 className="status-banner-label">{info.label}</h3>
    </div>
  );
}
