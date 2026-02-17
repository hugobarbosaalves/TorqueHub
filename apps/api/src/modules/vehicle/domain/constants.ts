/**
 * Constantes do módulo de veículos.
 * @module vehicle-constants
 */

/** Regex para placa antiga brasileira: ABC-1234. */
export const PLATE_REGEX_OLD = /^[A-Z]{3}-?\d{4}$/;

/** Regex para placa Mercosul brasileira: ABC1D23. */
export const PLATE_REGEX_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

/** Valida se a string é uma placa brasileira válida (antiga ou Mercosul). */
export function isValidBrazilianPlate(raw: string): boolean {
  const plate = raw.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');
  if (plate.length !== 7) return false;
  return PLATE_REGEX_OLD.test(plate) || PLATE_REGEX_MERCOSUL.test(plate);
}
