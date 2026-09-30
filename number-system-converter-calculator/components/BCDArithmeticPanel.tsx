'use client';

import { useState } from 'react';
import { ArrowRight, Binary, Plus, Minus } from 'lucide-react';
import {
  addBCD,
  BCDComplementMethod,
  BCDDigitStep,
  BCDResult,
  isValidBCDInput,
  subtractBCD
} from '@/utils/bcd';

type BCDOperation = 'addition' | 'subtraction';

function DigitStepsTable({ steps, rightLabel }: { steps: BCDDigitStep[]; rightLabel: string }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[#D6D3C1]">
      <table className="w-full min-w-[690px] border-collapse text-left text-xs">
        <thead className="bg-[#F2F1EB] text-[10px] uppercase tracking-wider text-[#8E917A]">
          <tr>
            <th className="px-3 py-2">Group</th>
            <th className="px-3 py-2">Digit addition</th>
            <th className="px-3 py-2">4-bit sum</th>
            <th className="px-3 py-2">Correction</th>
            <th className="px-3 py-2">BCD digit</th>
            <th className="px-3 py-2">Carry out</th>
          </tr>
        </thead>
        <tbody>
          {[...steps].reverse().map((step) => (
            <tr key={step.digitPosition} className="border-t border-[#D6D3C1] font-mono text-[#43413B]">
              <td className="px-3 py-2">10^{step.digitPosition}</td>
              <td className="px-3 py-2">{step.leftDigit} + {step.rightDigit} + {step.carryIn} ({rightLabel})</td>
              <td className="px-3 py-2">{step.binarySum}{step.rawCarryOut ? ' + carry' : ''}</td>
              <td className={`px-3 py-2 font-bold ${step.correctionApplied ? 'text-[#A44732]' : 'text-[#8E917A]'}`}>
                {step.correctionApplied ? '+ 0110' : 'none'}
              </td>
              <td className="px-3 py-2 font-bold">{step.correctedBinary}</td>
              <td className="px-3 py-2">{step.carryOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultDetails({ result }: { result: BCDResult }) {
  if (result.operation === 'addition') {
    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E917A]">Decimal result</p>
            <p className="mt-1 break-all font-mono text-2xl font-bold text-[#5A5A40]">{result.result}</p>
          </div>
          <div className="rounded-md bg-[#5A5A40] p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/65">Packed BCD</p>
            <p className="mt-1 break-all font-mono text-lg font-bold">{result.resultBcd}</p>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold text-[#5A5A40]">Digit-by-digit addition</h4>
          <DigitStepsTable steps={result.steps} rightLabel="carry in" />
        </div>
      </div>
    );
  }

  const methodLabel = result.method === '9s' ? "9's complement" : "10's complement";
  const sumDigits = result.sum.replace(/^1(?=\d)/, '');

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E917A]">Subtrahend conversion</p>
          {result.method === '10s' && (
            <p className="mt-2 font-mono text-sm text-[#43413B]">9&apos;s complement: {result.ninesComplement}</p>
          )}
          <p className="mt-1 font-mono text-sm text-[#43413B]">
            {result.method === '10s' ? "Add 1 for the 10's complement: " : "9's complement: "}
            {result.complementCarry ? `1${result.complement}` : result.complement}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-[#8E917A]">BCD: {result.complementBcd}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E917A]">BCD addition before carry rule</p>
          <p className="mt-1 font-mono text-lg font-bold text-[#5A5A40]">
            {result.left.padStart(result.width, '0')} + {result.complementCarry ? `1${result.complement}` : result.complement} = {result.sum}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-[#8E917A]">BCD sum: {result.sumBcd}</p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-bold text-[#5A5A40]">BCD addition groups</h4>
        <DigitStepsTable steps={result.additionSteps} rightLabel="carry in" />
      </div>

      <div className="rounded-md border border-[#D6D3C1] bg-white p-4 text-sm text-[#43413B]">
        <p className="font-bold text-[#5A5A40]">{methodLabel} carry rule</p>
        {result.method === '9s'
          ? result.carryOut
            ? <p className="mt-1">A final carry occurs, so apply end-around carry by adding 1 to the least significant BCD digit.</p>
            : <p className="mt-1">No final carry occurs, so the result is negative; take the 9&apos;s complement of the sum for its magnitude.</p>
          : result.carryOut
            ? <p className="mt-1">A final carry occurs, so discard it and keep the remaining BCD digits.</p>
            : <p className="mt-1">No final carry occurs, so the result is negative; take the 10&apos;s complement of the sum for its magnitude.</p>}
        {result.endAroundCarryApplied && (
          <p className="mt-2 font-mono text-xs">End-around step: {sumDigits} + 1</p>
        )}
      </div>

      {result.endAroundCarrySteps.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-bold text-[#5A5A40]">End-around carry addition</h4>
          <DigitStepsTable steps={result.endAroundCarrySteps} rightLabel="carry in" />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E917A]">Decimal result</p>
          <p className="mt-1 break-all font-mono text-2xl font-bold text-[#5A5A40]">{result.result}</p>
        </div>
        <div className="rounded-md bg-[#5A5A40] p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/65">Result BCD</p>
          <p className="mt-1 break-all font-mono text-lg font-bold">{result.resultBcd}</p>
        </div>
      </div>
    </div>
  );
}

export default function BCDArithmeticPanel() {
  const [left, setLeft] = useState('59');
  const [right, setRight] = useState('25');
  const [operation, setOperation] = useState<BCDOperation>('addition');
  const [method, setMethod] = useState<BCDComplementMethod>('9s');
  const inputsValid = isValidBCDInput(left) && isValidBCDInput(right) && left !== '' && right !== '';
  let result: BCDResult | null = null;

  if (inputsValid) {
    try {
      result = operation === 'addition' ? addBCD(left, right) : subtractBCD(left, right, method);
    } catch {
      result = null;
    }
  }

  const inputError = (left !== '' && !isValidBCDInput(left)) || (right !== '' && !isValidBCDInput(right));

  return (
    <section className="rounded-xl border border-[#D6D3C1] bg-[#FCFAF2] p-5 shadow-sm md:p-7" aria-labelledby="bcd-arithmetic-heading">
      <div className="mb-6 flex flex-col gap-3 border-b border-[#D6D3C1] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E917A]">
            <Binary className="h-4 w-4" /> Decimal digit arithmetic
          </div>
          <h2 id="bcd-arithmetic-heading" className="font-serif text-2xl font-bold text-[#5A5A40]">BCD Arithmetic</h2>
        </div>
        <p className="text-xs text-[#8E917A]">Unsigned whole-number inputs · up to 40 digits</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">
          First decimal number
          <input
            aria-label="First decimal number"
            inputMode="numeric"
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            className="min-h-12 rounded-md border border-[#D6D3C1] bg-white px-3 font-mono text-lg text-[#43413B] outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
          />
        </label>
        <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">
          Second decimal number
          <input
            aria-label="Second decimal number"
            inputMode="numeric"
            value={right}
            onChange={(event) => setRight(event.target.value)}
            className="min-h-12 rounded-md border border-[#D6D3C1] bg-white px-3 font-mono text-lg text-[#43413B] outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
          />
        </label>
        <div className="flex gap-2" role="group" aria-label="BCD operation">
          <button
            type="button"
            aria-pressed={operation === 'addition'}
            onClick={() => setOperation('addition')}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold transition-colors lg:flex-none ${operation === 'addition' ? 'border-[#5A5A40] bg-[#5A5A40] text-white' : 'border-[#D6D3C1] bg-white text-[#5A5A40] hover:border-[#8E917A]'}`}
          >
            <Plus className="h-4 w-4" /> Addition
          </button>
          <button
            type="button"
            aria-pressed={operation === 'subtraction'}
            onClick={() => setOperation('subtraction')}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold transition-colors lg:flex-none ${operation === 'subtraction' ? 'border-[#5A5A40] bg-[#5A5A40] text-white' : 'border-[#D6D3C1] bg-white text-[#5A5A40] hover:border-[#8E917A]'}`}
          >
            <Minus className="h-4 w-4" /> Subtraction
          </button>
        </div>
      </div>

      {operation === 'subtraction' && (
        <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Subtraction complement method">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">Complement method</span>
          {([
            { value: '9s', label: "9's Complement Method" },
            { value: '10s', label: "10's Complement Method" }
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={method === option.value}
              onClick={() => setMethod(option.value)}
              className={`min-h-10 rounded-md border px-3 text-xs font-bold transition-colors ${method === option.value ? 'border-[#8B4D36] bg-[#8B4D36] text-white' : 'border-[#D6D3C1] bg-white text-[#5A5A40] hover:border-[#8E917A]'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {inputError && <p className="mt-3 text-sm font-semibold text-red-700" role="alert">Enter decimal digits only, up to 40 digits per value.</p>}

      {result ? (
        <div className="mt-6 space-y-5 border-t border-[#D6D3C1] pt-5">
          <div className="flex items-center gap-2 font-mono text-lg font-bold text-[#5A5A40]">
            {left} {operation === 'addition' ? '+' : '−'} {right}
            <ArrowRight className="h-4 w-4 shrink-0 text-[#8E917A]" />
            {result.result}
          </div>
          <ResultDetails result={result} />
        </div>
      ) : !inputError ? (
        <p className="mt-6 border-t border-[#D6D3C1] pt-5 text-sm text-[#8E917A]">Enter both decimal numbers to see the BCD steps.</p>
      ) : null}
    </section>
  );
}