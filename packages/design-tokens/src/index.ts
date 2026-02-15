/**
 * @torquehub/design-tokens — Single source of truth for the TorqueHub design system.
 *
 * This package exports typed design tokens consumed by apps/web.
 * For Flutter, run `pnpm --filter @torquehub/design-tokens generate`
 * to regenerate `apps/mobile/lib/theme/app_tokens.dart`.
 *
 * @see tokens.json — canonical token definitions
 * @see DESIGN_SYSTEM.md — full documentation
 * @module @torquehub/design-tokens
 */

export { colors, type ColorTokens } from './colors.js';
export { typography, type TypographyTokens } from './typography.js';
export { spacing, type SpacingTokens } from './spacing.js';
export { radius, shadow } from './surfaces.js';
export { statusConfig, type StatusInfo } from './status.js';
