'use client';

import React from 'react';
import Calculator from '@/components/Calculator';
import { CalculatorProvider } from '@/components/CalculatorContext';

export default function Page() {
  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-[#F2F1EB] text-[#43413B] font-sans selection:bg-[#E8E6D8]">
        <header className="bg-transparent border-b border-[#D6D3C1] py-6 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#5A5A40] tracking-tight">Number System Converter</h1>
              <p className="text-[#8E917A] text-sm uppercase tracking-widest font-medium mt-1">Multi-base arithmetic calculator</p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <Calculator />
        </main>
      </div>
    </CalculatorProvider>
  );
}
