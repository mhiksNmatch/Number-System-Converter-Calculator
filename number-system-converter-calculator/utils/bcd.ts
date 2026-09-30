export type BCDComplementMethod = '9s' | '10s';

export interface BCDDigitStep {
  digitPosition: number;
  leftDigit: number;
  rightDigit: number;
  carryIn: number;
  binarySum: string;
  rawCarryOut: boolean;
  correctionApplied: boolean;
  correctedBinary: string;
  resultDigit: number;
  carryOut: number;
}

export interface BCDAdditionResult {
  operation: 'addition';
  left: string;
  right: string;
  result: string;
  resultBcd: string;
  steps: BCDDigitStep[];
}

export interface BCDSubtractionResult {
  operation: 'subtraction';
  method: BCDComplementMethod;
  left: string;
  right: string;
  width: number;
  ninesComplement: string;
  complement: string;
  complementCarry: boolean;
  complementBcd: string;
  sum: string;
  sumBcd: string;
  additionSteps: BCDDigitStep[];
  carryOut: boolean;
  endAroundCarrySteps: BCDDigitStep[];
  endAroundCarryApplied: boolean;
  result: string;
  resultBcd: string;
}

export type BCDResult = BCDAdditionResult | BCDSubtractionResult;

const MAX_DECIMAL_DIGITS = 40;

function normalizeDecimal(value: string): string {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error('Enter a non-negative whole-number decimal value.');
  }
  if (normalized.length > MAX_DECIMAL_DIGITS) {
    throw new Error(`Values must contain ${MAX_DECIMAL_DIGITS} digits or fewer.`);
  }
  return normalized.replace(/^0+(?=\d)/, '');
}

function encodeBCD(decimalDigits: string): string {
  return [...decimalDigits].map((digit) => Number(digit).toString(2).padStart(4, '0')).join(' ');
}

function addBCDGroups(left: string, right: string, width: number): {
  digits: string;
  carryOut: boolean;
  steps: BCDDigitStep[];
} {
  const paddedLeft = left.padStart(width, '0');
  const paddedRight = right.padStart(width, '0');
  const outputDigits: string[] = [];
  const steps: BCDDigitStep[] = [];
  let carry = 0;

  for (let digitPosition = 0; digitPosition < width; digitPosition += 1) {
    const leftDigit = Number(paddedLeft[width - digitPosition - 1]);
    const rightDigit = Number(paddedRight[width - digitPosition - 1]);
    const sum = leftDigit + rightDigit + carry;
    const rawNibble = sum & 0b1111;
    const correctionApplied = sum > 9 || sum > 0b1111;
    const corrected = correctionApplied ? sum + 0b0110 : sum;
    const resultDigit = corrected & 0b1111;
    const nextCarry = corrected > 0b1111 ? 1 : 0;

    steps.push({
      digitPosition,
      leftDigit,
      rightDigit,
      carryIn: carry,
      binarySum: rawNibble.toString(2).padStart(4, '0'),
      rawCarryOut: sum > 0b1111,
      correctionApplied,
      correctedBinary: resultDigit.toString(2).padStart(4, '0'),
      resultDigit,
      carryOut: nextCarry
    });
    outputDigits.unshift(String(resultDigit));
    carry = nextCarry;
  }

  return { digits: outputDigits.join(''), carryOut: carry === 1, steps };
}

function incrementBCD(value: string): { digits: string; carryOut: boolean; steps: BCDDigitStep[] } {
  return addBCDGroups(value, '1', value.length);
}

function complementDigits(value: string, method: BCDComplementMethod): string {
  const ninesComplement = [...value].map((digit) => String(9 - Number(digit))).join('');
  if (method === '9s') return ninesComplement;

  const incremented = incrementBCD(ninesComplement);
  return incremented.carryOut ? '0'.repeat(value.length) : incremented.digits;
}

export function addBCD(leftValue: string, rightValue: string): BCDAdditionResult {
  const left = normalizeDecimal(leftValue);
  const right = normalizeDecimal(rightValue);
  const width = Math.max(left.length, right.length);
  const sum = addBCDGroups(left, right, width);
  const result = `${sum.carryOut ? '1' : ''}${sum.digits}`.replace(/^0+(?=\d)/, '');

  return {
    operation: 'addition',
    left,
    right,
    result,
    resultBcd: encodeBCD(result),
    steps: sum.steps
  };
}

export function subtractBCD(
  leftValue: string,
  rightValue: string,
  method: BCDComplementMethod
): BCDSubtractionResult {
  const left = normalizeDecimal(leftValue);
  const right = normalizeDecimal(rightValue);
  const width = Math.max(left.length, right.length);
  const paddedLeft = left.padStart(width, '0');
  const paddedRight = right.padStart(width, '0');
  const ninesComplement = [...paddedRight].map((digit) => String(9 - Number(digit))).join('');
  const complement = complementDigits(paddedRight, method);
  const complementCarry = method === '10s' && /^0+$/.test(paddedRight);
  const sum = addBCDGroups(paddedLeft, complement, width);
  const carryOut = sum.carryOut || complementCarry;
  const endAroundCarryApplied = method === '9s' && carryOut;
  const endAround = endAroundCarryApplied ? incrementBCD(sum.digits) : null;
  const finalDigits = endAround?.digits ?? sum.digits;
  const finalCarryOut = carryOut;
  let result: string;

  if (finalCarryOut) {
    result = finalDigits;
  } else {
    const magnitude = method === '9s'
      ? [...finalDigits].map((digit) => String(9 - Number(digit))).join('')
      : complementDigits(finalDigits, '10s');
    const normalizedMagnitude = magnitude.replace(/^0+(?=\d)/, '');
    result = normalizedMagnitude === '0' ? '0' : `-${normalizedMagnitude}`;
  }

  const resultMagnitude = result.replace(/^-/, '');
  const normalizedResult = resultMagnitude.replace(/^0+(?=\d)/, '');

  return {
    operation: 'subtraction',
    method,
    left,
    right,
    width,
    ninesComplement,
    complement,
    complementCarry,
    complementBcd: encodeBCD(`${complementCarry ? '1' : ''}${complement}`),
    sum: `${carryOut ? '1' : ''}${sum.digits}`,
    sumBcd: encodeBCD(`${carryOut ? '1' : ''}${sum.digits}`),
    additionSteps: sum.steps,
    carryOut,
    endAroundCarrySteps: endAround?.steps ?? [],
    endAroundCarryApplied,
    result,
    resultBcd: `${result.startsWith('-') ? '-' : ''}${encodeBCD(normalizedResult)}`
  };
}

export function isValidBCDInput(value: string): boolean {
  return value === '' || (/^\d+$/.test(value) && value.length <= MAX_DECIMAL_DIGITS);
}