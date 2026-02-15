/**
 * Typography tokens — font family, sizes, weights, and line heights.
 * @module typography
 */

/** Typography token tree shape. */
export interface TypographyTokens {
  fontFamily: { sans: string };
  fontSize: Record<string, number>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

/** TorqueHub typography scale — derived from tokens.json. */
export const typography: TypographyTokens = {
  fontFamily: {
    sans: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 22,
    '4xl': 24,
    '5xl': 32,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
