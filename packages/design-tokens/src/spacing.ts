/**
 * Spacing tokens — consistent spacing scale used across the entire project.
 * Values in pixels. Keys represent the scale step.
 * @module spacing
 */

/** Spacing token shape. */
export interface SpacingTokens {
  [key: string]: number;
}

/** TorqueHub spacing scale — derived from tokens.json. */
export const spacing: SpacingTokens = {
  '0': 0,
  '1': 2,
  '2': 4,
  '3': 6,
  '4': 8,
  '5': 10,
  '6': 12,
  '8': 16,
  '10': 20,
  '12': 24,
  '14': 28,
  '16': 32,
  '20': 40,
  '24': 48,
} as const;
