'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Base } from '@/lib/converter';
import { diminishedRadixComplement, getComplementLabels, radixComplement } from '@/lib/complements';

interface ComplementInputCardProps {
  label: string;
  base: Base;
  value: string;
  digits: number;
  onChange?: (value: string) => void;
}

function CopyPill({ value, className = '' }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-md border border-[#D6D3C1] bg-[#F2F1EB] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A5A40] transition hover:border-[#5A5A40] hover:bg-[#E8E6D8] ${className}`}
      title="Click to copy"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function ComplementInputCard({ label, base, value, digits, onChange }: ComplementInputCardProps) {
  const labels = useMemo(() => getComplementLabels(base), [base]);
  const diminished = useMemo(() => {
    if (!value || value.trim() === '') return '0';
    return diminishedRadixComplement(value, base, digits);
  }, [base, digits, value]);

  const radix = useMemo(() => {
    if (!value || value.trim() === '') return '0';
    return radixComplement(value, base, digits);
  }, [base, digits, value]);

  return (
    <div className="rounded-xl border border-[#D6D3C1] bg-[#FCFAF2] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E917A]">{label}</label>
        <span className="rounded-md border border-[#D6D3C1] bg-[#F2F1EB] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A5A40]">
          Base {base}
        </span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Enter value"
        className="min-h-11 w-full rounded-lg border border-[#D6D3C1] bg-white px-3 py-2 font-mono text-base text-[#5A5A40] outline-none transition focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
      />

      <div className="mt-4 rounded-lg border border-[#D6D3C1] bg-[#F2F1EB] p-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E917A]">Complements</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#D6D3C1] bg-white p-3">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">{labels.diminishedLabel}</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-[#43413B]">{diminished}</span>
              <CopyPill value={diminished} />
            </div>
          </div>

          <div className="rounded-lg border border-[#D6D3C1] bg-white p-3">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E917A]">{labels.radixLabel}</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-[#43413B]">{radix}</span>
              <CopyPill value={radix} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
