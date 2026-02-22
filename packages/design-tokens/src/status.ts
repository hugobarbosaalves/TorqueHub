/**
 * Status configuration — labels, icons, and colors for order statuses.
 * Single source of truth for status rendering across web and mobile.
 * @module status
 */

import { colors } from './colors.js';

/** Information needed to render a status badge/banner. */
export interface StatusInfo {
  label: string;
  /** Lucide icon name (PascalCase) used by web. Mobile uses its own icon mapping. */
  icon: string;
  color: string;
}

/** Status display configuration map — derived from tokens.json. */
export const statusConfig: Record<string, StatusInfo> = {
  DRAFT: { label: 'Rascunho', icon: 'Pencil', color: colors.status['DRAFT'] ?? '' },
  PENDING_APPROVAL: {
    label: 'Aguardando Aprovação',
    icon: 'Clock',
    color: colors.status['PENDING_APPROVAL'] ?? '',
  },
  APPROVED: { label: 'Aprovada', icon: 'ThumbsUp', color: colors.status['APPROVED'] ?? '' },
  IN_PROGRESS: {
    label: 'Em Andamento',
    icon: 'Wrench',
    color: colors.status['IN_PROGRESS'] ?? '',
  },
  COMPLETED: {
    label: 'Concluído',
    icon: 'CheckCircle2',
    color: colors.status['COMPLETED'] ?? '',
  },
  CANCELLED: { label: 'Cancelada', icon: 'XCircle', color: colors.status['CANCELLED'] ?? '' },
};
