'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Base } from '@/lib/converter';
import { calculateComplementSubtraction, getComplementLabels } from '@/lib/complements';

interface ComplementSubtractionPanelProps {
  inputs: Array<{ id: string; base: Base; value: string; error?: string }>;
}

export default function ComplementSubtractionPanel({ inputs }: ComplementSubtractionPanelProps) {
  const [selectedMinuendId, setSelectedMinuendId] = useState(inputs[0]?.id ?? '');
  const [selectedSubtrahendId, setSelectedSubtrahendId] = useState(inputs[1]?.id ?? inputs[0]?.id ?? '');
  const [calculationBase, setCalculationBase] = useState<'auto' | Base>('auto');

  const minuend = inputs.find((input) => input.id === selectedMinuendId) ?? inputs[0];
  const subtrahend = inputs.find((input) => input.id === selectedSubtrahendId) ?? inputs[1] ?? inputs[0];

  const base = useMemo(() => {
    if (calculationBase !== 'auto') return calculationBase;
    return minuend?.base ?? 10;
  }, [calculationBase, minuend]);

  const digits = useMemo(() => {
    const maxLength = Math.max(
      (minuend?.value ?? '0').replace(/^-/, '').length,
      (subtrahend?.value ?? '0').replace(/^-/, '').length,
      1
    );
    return Math.max(1, maxLength);
  }, [minuend, subtrahend]);

  const labels = useMemo(() => getComplementLabels(base), [base]);
  const diminishedTitle = `${labels.diminishedLabel} Complement Method`;
  const radixTitle = `${labels.radixLabel} Complement Method`;

  const diminished = useMemo(() => {
    if (!minuend || !subtrahend) return null;
    return calculateComplementSubtraction({
      minuend: minuend.value,
      subtrahend: subtrahend.value,
      base,
      method: 'diminished',
      digits
    });
  }, [base, digits, minuend, subtrahend]);

  const radix = useMemo(() => {
    if (!minuend || !subtrahend) return null;
    return calculateComplementSubtraction({
      minuend: minuend.value,
      subtrahend: subtrahend.value,
      base,
      method: 'radix',
      digits
    });
  }, [base, digits, minuend, subtrahend]);

  const expression = `${minuend?.value ?? '0'} - ${subtrahend?.value ?? '0'}`;

  return (
    <div className="rounded-xl border border-[#D6D3C1] bg-[#FCFAF2] p-5 shadow-sm md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E917A]">Subtraction via complements</p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-[#5A5A40]">Complement Arithmetic</h3>
        </div>
        <div className="w-fit rounded-md border border-[#D6D3C1] bg-[#F2F1EB] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A5A40]">
          Base {base}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">
          Minuend (M)
          <select
            value={selectedMinuendId}
            onChange={(event) => setSelectedMinuendId(event.target.value)}
            className="min-h-11 rounded-lg border border-[#D6D3C1] bg-white px-3 py-2 text-sm font-medium text-[#43413B] outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
          >
            {inputs.map((input) => (
              <option key={input.id} value={input.id}>
                {input.value || 'Empty input'} • Base {input.base}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">
          Subtrahend (N)
          <select
            value={selectedSubtrahendId}
            onChange={(event) => setSelectedSubtrahendId(event.target.value)}
            className="min-h-11 rounded-lg border border-[#D6D3C1] bg-white px-3 py-2 text-sm font-medium text-[#43413B] outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
          >
            {inputs.map((input) => (
              <option key={input.id} value={input.id}>
                {input.value || 'Empty input'} • Base {input.base}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">
          Calculation Base
          <select
            value={calculationBase}
            onChange={(event) => setCalculationBase(event.target.value === 'auto' ? 'auto' : Number(event.target.value) as Base)}
            className="min-h-11 rounded-lg border border-[#D6D3C1] bg-white px-3 py-2 text-sm font-medium text-[#43413B] outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
          >
            <option value="auto">Auto / Minuend's Base</option>
            <option value={2}>Binary</option>
            <option value={8}>Octal</option>
            <option value={10}>Decimal</option>
            <option value={16}>Hexadecimal</option>
          </select>
        </label>
      </div>

      <div className="mb-6 overflow-x-auto rounded-lg border border-[#D6D3C1] bg-[#F2F1EB] p-4 text-center font-mono text-lg text-[#43413B]">
        {expression}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#D6D3C1] bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E917A]">
            <ArrowLeftRight className="h-4 w-4" />
            {diminishedTitle}
          </div>

          {diminished ? (
            <div className="space-y-3 text-sm text-[#43413B]">
              <p className="font-mono text-[#5A5A40]">M + Comp_{base - 1}(N)</p>
              <p className="font-mono text-[#5A5A40]">{diminished.equation}</p>
              <p className="rounded-lg bg-[#F2F1EB] p-3">
                <span className="font-bold text-[#5A5A40]">Complement:</span> {diminished.complement} ({labels.diminishedLabel})
              </p>
              <p className="rounded-lg bg-[#F2F1EB] p-3">
                <span className="font-bold text-[#5A5A40]">Result:</span> {diminished.finalAnswer}
              </p>
              <p className="rounded-lg border border-[#D6D3C1] bg-[#FCFAF2] p-3 text-xs leading-relaxed text-[#43413B]">
                {diminished.explanation} Formula used: (r^n) - 1 - N, with r = {base} and n = {digits}.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#8E917A]">Select valid inputs to calculate.</p>
          )}
        </div>

        <div className="rounded-xl border border-[#D6D3C1] bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E917A]">
            <ArrowRight className="h-4 w-4" />
            {radixTitle}
          </div>

          {radix ? (
            <div className="space-y-3 text-sm text-[#43413B]">
              <p className="font-mono text-[#5A5A40]">M + Comp_r(N)</p>
              <p className="font-mono text-[#5A5A40]">{radix.equation}</p>
              <p className="rounded-lg bg-[#F2F1EB] p-3">
                <span className="font-bold text-[#5A5A40]">Complement:</span> {radix.complement} ({labels.radixLabel})
              </p>
              <p className="rounded-lg bg-[#F2F1EB] p-3">
                <span className="font-bold text-[#5A5A40]">Result:</span> {radix.finalAnswer}
              </p>
              <p className="rounded-lg border border-[#D6D3C1] bg-[#FCFAF2] p-3 text-xs leading-relaxed text-[#43413B]">
                {radix.explanation} Formula used: (r^n) - N, with r = {base} and n = {digits}.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#8E917A]">Select valid inputs to calculate.</p>
          )}
        </div>
      </div>
    </div>
  );
}
