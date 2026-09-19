export type Base = 2 | 8 | 10 | 16;

const BASE_REGEX: Record<Base, RegExp> = {
  2: /^-?[01]+$/,
  8: /^-?[0-7]+$/,
  10: /^-?[0-9]+$/,
  16: /^-?[0-9a-fA-F]+$/
};

const BASE_DIGITS = '0123456789ABCDEF';

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

/**
 * Converts a unsigned integer string in the requested base to a BigInt.
 */
function parseUnsignedBigInt(value: string, base: Base): bigint {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error('Number is empty.');
  }

  if (normalized.startsWith('-')) {
    throw new Error('Use an unsigned value for complement arithmetic.');
  }

  if (!isValidNumber(normalized, base)) {
    throw new Error(`Invalid number format for base ${base}: ${value}`);
  }

  let result = 0n;

  for (const char of normalized.toUpperCase()) {
    const digitValue = BASE_DIGITS.indexOf(char);
    if (digitValue === -1) {
      throw new Error(`Unsupported digit '${char}' in base ${base}.`);
    }
    result = result * BigInt(base) + BigInt(digitValue);
  }

  return result;
}

/**
 * Formats a bigint as a string in the requested base, keeping the digits uppercase for hexadecimal.
 */
function formatUnsignedBigInt(value: bigint, base: Base, minDigits = 1): string {
  if (value === 0n && minDigits === 0) {
    return '0';
  }

  let result = '';
  let current = value;

  while (current > 0n) {
    const digitIndex = Number(current % BigInt(base));
    result = BASE_DIGITS[digitIndex] + result;
    current = current / BigInt(base);
  }

  if (result === '') {
    result = '0';
  }

  if (result.length < minDigits) {
    result = '0'.repeat(minDigits - result.length) + result;
  }

  return result;
}

/**
 * Validates the digit count for base-r complement arithmetic.
 */
function validateDigitCount(value: string, base: Base, nDigits: number): bigint {
  if (!Number.isInteger(nDigits) || nDigits <= 0) {
    throw new Error('nDigits must be a positive integer.');
  }

  const magnitude = parseUnsignedBigInt(value, base);
  const maxValue = BigInt(base) ** BigInt(nDigits) - 1n;

  if (magnitude > maxValue) {
    throw new Error(
      `The value ${value} exceeds the allowed ${nDigits}-digit range in base ${base}.`
    );
  }

  return magnitude;
}

/**
 * Calculates the diminished radix complement of N: (r^n - 1) - N
 * This represents the complement using all n digits in base r.
 */
export function diminishedRadixComplement(value: string, base: Base, nDigits: number): string {
  const magnitude = validateDigitCount(value, base, nDigits);
  const radixPower = BigInt(base) ** BigInt(nDigits);
  const complement = radixPower - 1n - magnitude;

  return formatUnsignedBigInt(complement, base, nDigits);
}

/**
 * Calculates the radix complement of N: r^n - N
 * When N = 0, this produces a value of size n+1 digits (1 followed by n zeros),
 * which is expected in complement arithmetic and is handled during subtraction.
 */
export function radixComplement(value: string, base: Base, nDigits: number): string {
  const magnitude = validateDigitCount(value, base, nDigits);
  const radixPower = BigInt(base) ** BigInt(nDigits);
  const complement = radixPower - magnitude;

  if (complement === radixPower) {
    return '1' + '0'.repeat(nDigits);
  }

  return formatUnsignedBigInt(complement, base, nDigits);
}

/**
 * Adds two non-negative unsigned values in a given base and returns the sum plus a carry flag.
 * This is used by the subtraction algorithms below to emulate complement arithmetic.
 */
export function addUnsignedValues(left: string, right: string, base: Base): { sum: string; carryOut: boolean } {
  const leftValue = parseUnsignedBigInt(left, base);
  const rightValue = parseUnsignedBigInt(right, base);
  const result = leftValue + rightValue;
  const radixPower = BigInt(base) ** 10n; // sentinel only, not used for carry logic in this helper

  // The helper is intentionally simple and kept for arithmetic readability.
  // Complement subtraction below performs the carry logic using the explicit r^n bound.
  return {
    sum: formatUnsignedBigInt(result, base),
    carryOut: false,
  };
}

/**
 * Subtraction using the (r-1)'s complement method.
 *
 * Steps:
 * 1. Take the diminished radix complement of B: (r^n - 1) - B
 * 2. Add it to A: A + [(r^n - 1) - B]
 * 3. If a carry out occurs, add that carry to the least significant digit (end-around carry)
 * 4. If no carry out occurs, the result is negative; take the diminished complement again
 *    to find the magnitude and prepend a minus sign.
 */
export function subtractUsingDiminishedRadixComplement(
  minuend: string,
  subtrahend: string,
  base: Base,
  nDigits: number
): string {
  const aValue = validateDigitCount(minuend, base, nDigits);
  const bValue = validateDigitCount(subtrahend, base, nDigits);
  const radixPower = BigInt(base) ** BigInt(nDigits);

  // (r - 1)'s complement of B: r^n - 1 - B
  const complementOfB = radixPower - 1n - bValue;

  // Add A to the complement of B
  const sum = aValue + complementOfB;

  // If there is a carry out, use the end-around carry rule.
  if (sum >= radixPower) {
    const finalValue = (sum - radixPower) + 1n;
    return formatUnsignedBigInt(finalValue, base, nDigits);
  }

  // No carry means the result is negative.
  // The magnitude is the diminished complement of the sum.
  const magnitude = (radixPower - 1n) - sum;
  return `-${formatUnsignedBigInt(magnitude, base, nDigits)}`;
}

/**
 * Subtraction using the r's complement method.
 *
 * Steps:
 * 1. Take the radix complement of B: r^n - B
 * 2. Add it to A: A + (r^n - B)
 * 3. If a final carry out occurs, discard it
 * 4. If no final carry out occurs, the result is negative; the magnitude is the radix complement
 *    of the sum and is prefixed with a minus sign.
 */
export function subtractUsingRadixComplement(
  minuend: string,
  subtrahend: string,
  base: Base,
  nDigits: number
): string {
  const aValue = validateDigitCount(minuend, base, nDigits);
  const bValue = validateDigitCount(subtrahend, base, nDigits);
  const radixPower = BigInt(base) ** BigInt(nDigits);

  // r's complement of B: r^n - B
  const complementOfB = radixPower - bValue;

  // Add A to the complement of B
  const sum = aValue + complementOfB;

  // In the r's complement method, any final carry out is discarded.
  if (sum >= radixPower) {
    const finalValue = sum - radixPower;
    return formatUnsignedBigInt(finalValue, base, nDigits);
  }

  // No final carry means the result is negative.
  // The magnitude is r^n - sum.
  const magnitude = radixPower - sum;
  return `-${formatUnsignedBigInt(magnitude, base, nDigits)}`;
}
