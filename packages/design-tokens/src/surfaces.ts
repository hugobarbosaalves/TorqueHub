/**
 * Surface tokens — border radii and shadow definitions.
 * @module surfaces
 */

/** Border radius scale (px). */
export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  pill: 20,
  full: 9999,
} as const;

/** Box shadow presets. */
export const shadow = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.15)',
} as const;
