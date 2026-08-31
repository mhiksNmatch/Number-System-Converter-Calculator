export type Base = 2 | 8 | 10 | 16;

const BASE_REGEX: Record<Base, RegExp> = {
  2: /^-?[01]+$/,
  8: /^-?[0-7]+$/,
  10: /^-?[0-9]+$/,
  16: /^-?[0-9a-fA-F]+$/
};

/**
 * Robust input validation function.
 * Takes a number string and its base as input and returns true if valid, false otherwise.
 */
export function isValidNumber(value: string, base: Base): boolean {
  if (!value || value.trim() === '') return false;
  return BASE_REGEX[base].test(value.trim());
}

/**
 * Converts a number string from any of the four bases to Decimal.
 */
export function toDecimal(value: string, fromBase: Base): number {
  if (!isValidNumber(value, fromBase)) {
    throw new Error(`Invalid number format for base ${fromBase}`);
  }
  return parseInt(value.trim(), fromBase);
}

/**
 * Converts a Decimal number to Binary, Octal, Decimal, or Hexadecimal.
 */
export function fromDecimal(value: number, toBase: Base): string {
  if (isNaN(value) || !isFinite(value)) return 'Undefined';
  
  // Convert to target base and handle negative sign properly
  const isNeg = value < 0;
  const absNum = Math.abs(value);
  const converted = absNum.toString(toBase).toUpperCase();
  return isNeg ? `-${converted}` : converted;
}
