/**
 * Status configuration — labels, icons, and colors for order statuses.
 * Single source of truth for status rendering across web and mobile.
 * @module status
 */

import { colors } from './colors.js';

/** Information needed to render a status badge/banner. */
export interface StatusInfo {
  label: string;
  icon: string;
  color: string;
}

/** Status display configuration map — derived from tokens.json. */
export const statusConfig: Record<string, StatusInfo> = {
  DRAFT: { label: 'Rascunho', icon: '📝', color: colors.status['DRAFT'] ?? '' },
  PENDING_APPROVAL: {
    label: 'Aguardando Aprovação',
    icon: '⏳',
    color: colors.status['PENDING_APPROVAL'] ?? '',
  },
  APPROVED: { label: 'Aprovada', icon: '👍', color: colors.status['APPROVED'] ?? '' },
  IN_PROGRESS: { label: 'Em Andamento', icon: '🔧', color: colors.status['IN_PROGRESS'] ?? '' },
  COMPLETED: { label: 'Concluído', icon: '✅', color: colors.status['COMPLETED'] ?? '' },
  CANCELLED: { label: 'Cancelada', icon: '❌', color: colors.status['CANCELLED'] ?? '' },
};
