/**
 * Checks if a value is defined (not null or undefined).
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Asserts a condition, throwing an error if false.
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[TorqueHub Assertion] ${message}`);
  }
}

/**
 * Generates a simple unique ID (not cryptographically secure).
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Converts a string to slug format.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/[\s_]+/g, '-')
    .replaceAll(/-+/g, '-');
}

/**
 * Rounds a number to a given number of decimal places.
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Formats cents to a BRL currency string.
 */
export function formatCurrency(valueInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100);
}

/**
 * Returns the current ISO timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString();
}
