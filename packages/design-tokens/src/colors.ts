/**
 * Color tokens — brand, semantic, neutral, surface, and status palettes.
 * @module colors
 */

/** Color token tree shape. */
export interface ColorTokens {
  brand: { primary: string; primaryLight: string; accent: string };
  semantic: { success: string; warning: string; danger: string; info: string };
  neutral: Record<string, string>;
  surface: { background: string; card: string; border: string };
  whatsapp: string;
  status: Record<string, string>;
}

/** TorqueHub color palette — derived from tokens.json. */
export const colors: ColorTokens = {
  brand: {
    primary: '#1A1A2E',
    primaryLight: '#16213E',
    accent: '#3B82F6',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  neutral: {
    '50': '#F8FAFC',
    '100': '#F1F5F9',
    '200': '#E2E8F0',
    '300': '#CBD5E1',
    '400': '#94A3B8',
    '500': '#64748B',
    '600': '#475569',
    '700': '#334155',
    '800': '#1E293B',
    '900': '#0F172A',
  },
  surface: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  whatsapp: '#25D366',
  status: {
    DRAFT: '#94A3B8',
    PENDING_APPROVAL: '#F59E0B',
    APPROVED: '#3B82F6',
    IN_PROGRESS: '#8B5CF6',
    COMPLETED: '#22C55E',
    CANCELLED: '#EF4444',
  },
} as const;
