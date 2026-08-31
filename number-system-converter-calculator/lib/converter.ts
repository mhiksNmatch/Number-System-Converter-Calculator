export type Base = 2 | 8 | 10 | 16;

const BASE_REGEX: Record<Base, RegExp> = {
  2: /^-?[01]+$/,
  8: /^-?[0-7]+$/,
  10: /^-?[0-9]+$/,
  16: /^-?[0-9a-fA-F]+$/
};

export function isValidNumber(value: string, base: Base): boolean {
  if (!value || value.trim() === '') return false;
  return BASE_REGEX[base].test(value.trim());
}

export function toDecimal(value: string, fromBase: Base): number {
  if (!isValidNumber(value, fromBase)) throw new Error(`Invalid format`);
  return parseInt(value.trim(), fromBase);
}

export function fromDecimal(value: number, toBase: Base): string {
  if (isNaN(value) || !isFinite(value)) return 'Undefined';
  const isNeg = value < 0;
  const converted = Math.abs(value).toString(toBase).toUpperCase();
  return isNeg ? `-${converted}` : converted;
}