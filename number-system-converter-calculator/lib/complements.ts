import type { Base } from './converter';

const BASE_DIGITS = '0123456789ABCDEF';

export type ComplementMethod = 'diminished' | 'radix';

export interface ComplementLabels {
  diminishedLabel: string;
  radixLabel: string;
}

export interface ComplementSubtractionResult {
  method: ComplementMethod;
  equation: string;
  complement: string;
  finalAnswer: string;
  carryOut: boolean;
  explanation: string;
}

export function getComplementLabels(base: Base): ComplementLabels {
  const labelsByBase: Record<Base, ComplementLabels> = {
    2: { diminishedLabel: "1's", radixLabel: "2's" },
    8: { diminishedLabel: "7's", radixLabel: "8's" },
    10: { diminishedLabel: "9's", radixLabel: "10's" },
    16: { diminishedLabel: "15's", radixLabel: "16's" }
  };

  return labelsByBase[base];
}

function normalizeUnsignedValue(value: string, base: Base): string {
  const trimmed = value.trim();
  if (!trimmed) return '0';

  const clean = trimmed.replace(/^[+]/, '').replace(/^-/, '');
  const upper = clean.toUpperCase();

  for (const character of upper) {
    const digitIndex = BASE_DIGITS.indexOf(character);
    if (digitIndex === -1) {
      const allowed = {
        2: '01',
        8: '01234567',
        10: '0123456789',
        16: '0123456789ABCDEF'
      }[base];
      throw new Error(`Character '${character}' is not valid in base ${base}. Allowed digits: ${allowed}`);
    }
  }

  return upper;
}

function toUnsignedBigInt(value: string, base: Base): bigint {
  const normalized = normalizeUnsignedValue(value, base);
  let result = 0n;

  for (const character of normalized) {
    const digitValue = BASE_DIGITS.indexOf(character.toUpperCase());
    result = result * BigInt(base) + BigInt(digitValue);
  }

  return result;
}

function formatUnsignedBigInt(value: bigint, base: Base, minDigits: number): string {
  if (value === 0n && minDigits === 0) return '0';

  let result = '';
  let current = value;

  while (current > 0n) {
    const remainder = Number(current % BigInt(base));
    result = BASE_DIGITS[remainder] + result;
    current /= BigInt(base);
  }

  if (result.length === 0) {
    result = '0';
  }

  if (result.length < minDigits) {
    result = '0'.repeat(minDigits - result.length) + result;
  }

  return result;
}

export function padUnsignedValue(value: string, base: Base, digits: number): string {
  const normalized = normalizeUnsignedValue(value, base);
  const targetDigits = Math.max(digits, normalized.length);
  return normalized.padStart(targetDigits, '0');
}

export function diminishedRadixComplement(value: string, base: Base, digits: number): string {
  const normalizedValue = padUnsignedValue(value, base, digits);
  const magnitude = toUnsignedBigInt(normalizedValue, base);
  const radixPower = BigInt(base) ** BigInt(digits);
  const complement = radixPower - 1n - magnitude;

  return formatUnsignedBigInt(complement, base, digits);
}

export function radixComplement(value: string, base: Base, digits: number): string {
  const normalizedValue = padUnsignedValue(value, base, digits);
  const magnitude = toUnsignedBigInt(normalizedValue, base);
  const radixPower = BigInt(base) ** BigInt(digits);
  const complement = radixPower - magnitude;

  return formatUnsignedBigInt(complement, base, digits);
}

export function calculateComplementSubtraction({
  minuend,
  subtrahend,
  base,
  method,
  digits
}: {
  minuend: string;
  subtrahend: string;
  base: Base;
  method: ComplementMethod;
  digits: number;
}): ComplementSubtractionResult {
  const effectiveDigits = Math.max(1, digits || Math.max(minuend.length, subtrahend.length));
  const normalizedMinuend = padUnsignedValue(minuend, base, effectiveDigits);
  const normalizedSubtrahend = padUnsignedValue(subtrahend, base, effectiveDigits);
  const minuendValue = toUnsignedBigInt(normalizedMinuend, base);
  const subtrahendValue = toUnsignedBigInt(normalizedSubtrahend, base);
  const radixPower = BigInt(base) ** BigInt(effectiveDigits);

  const complementValue = method === 'diminished'
    ? radixPower - 1n - subtrahendValue
    : radixPower - subtrahendValue;

  const sumValue = minuendValue + complementValue;
  const carryOut = sumValue >= radixPower;

  if (method === 'diminished') {
    if (carryOut) {
      const finalValue = sumValue - radixPower + 1n;
      return {
        method,
        equation: `${normalizedMinuend} + ${formatUnsignedBigInt(complementValue, base, effectiveDigits)}`,
        complement: formatUnsignedBigInt(complementValue, base, effectiveDigits),
        finalAnswer: formatUnsignedBigInt(finalValue, base, effectiveDigits),
        carryOut: true,
        explanation: 'Carry-out occurs, so apply the end-around carry by adding 1 to the least significant digit.'
      };
    }

    const magnitude = radixPower - 1n - sumValue;
    return {
      method,
      equation: `${normalizedMinuend} + ${formatUnsignedBigInt(complementValue, base, effectiveDigits)}`,
      complement: formatUnsignedBigInt(complementValue, base, effectiveDigits),
      finalAnswer: `-${formatUnsignedBigInt(magnitude, base, effectiveDigits)}`,
      carryOut: false,
      explanation: 'No carry-out occurs, so the result is negative. Take the diminished complement of the sum.'
    };
  }

  if (carryOut) {
    const finalValue = sumValue - radixPower;
    return {
      method,
      equation: `${normalizedMinuend} + ${formatUnsignedBigInt(complementValue, base, effectiveDigits)}`,
      complement: formatUnsignedBigInt(complementValue, base, effectiveDigits),
      finalAnswer: formatUnsignedBigInt(finalValue, base, effectiveDigits),
      carryOut: true,
      explanation: 'A final carry-out occurs, so discard it and keep the remaining digits.'
    };
  }

  const magnitude = radixPower - sumValue;
  return {
    method,
    equation: `${normalizedMinuend} + ${formatUnsignedBigInt(complementValue, base, effectiveDigits)}`,
    complement: formatUnsignedBigInt(complementValue, base, effectiveDigits),
    finalAnswer: `-${formatUnsignedBigInt(magnitude, base, effectiveDigits)}`,
    carryOut: false,
    explanation: 'No final carry-out occurs, so the result is negative and the magnitude is the radix complement.'
  };
}
