/**
 * Maps status icon names (from statusConfig) to Lucide React components.
 * Used to render the correct icon for each service order status.
 * @module statusIcons
 */

import type { LucideIcon } from 'lucide-react';
import {
  Pencil,
  Clock,
  ThumbsUp,
  Wrench,
  CheckCircle2,
  XCircle,
  CircleHelp,
} from './icons';

/** Map of icon name → Lucide component. */
const STATUS_ICON_MAP: Record<string, LucideIcon> = {
  Pencil,
  Clock,
  ThumbsUp,
  Wrench,
  CheckCircle2,
  XCircle,
};

/** Returns the Lucide icon component for a given status icon name. Falls back to CircleHelp. */
export function getStatusIcon(iconName: string): LucideIcon {
  return STATUS_ICON_MAP[iconName] ?? CircleHelp;
}
