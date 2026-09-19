'use client';

import React from 'react';
import Calculator from '@/components/Calculator';
import { CalculatorProvider } from '@/components/CalculatorContext';

export default function Page() {
  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-[#F2F1EB] text-[#43413B] font-sans selection:bg-[#E8E6D8]">
        <header className="sticky top-0 z-10 border-b border-[#D6D3C1]/90 bg-[#FCFAF2]/95 py-5 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8E917A]">
                <span className="h-2 w-2 rounded-full bg-[#5A5A40]" />
                Calculation workspace
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#5A5A40] sm:text-4xl">Number System Converter</h1>
              <p className="mt-1 text-sm text-[#8E917A]">Multi-base arithmetic, conversion, and complement tools.</p>
            </div>
            <div className="hidden rounded-full border border-[#D6D3C1] bg-[#F2F1EB] px-4 py-2 text-xs font-semibold text-[#5A5A40] lg:block">
              Binary · Octal · Decimal · Hexadecimal
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Calculator />
        </main>
      </div>
    </CalculatorProvider>
  );
}
