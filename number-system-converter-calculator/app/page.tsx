'use client';

import React, { useState } from 'react';
import Calculator from '@/components/Calculator';
import { CalculatorProvider } from '@/components/CalculatorContext';
import { FileText, Calculator as CalcIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'documentation'>('calculator');

  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-[#F2F1EB] text-[#43413B] font-sans selection:bg-[#E8E6D8]">
        <header className="bg-transparent border-b border-[#D6D3C1] py-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#5A5A40] tracking-tight">Number System Converter</h1>
              <p className="text-[#8E917A] text-sm mt-1">Base math, simplified.</p>
            </div>
            
            <div className="flex items-center p-1 bg-[#E8E6D8] rounded-lg border border-[#D6D3C1]">
              <button onClick={() => setActiveTab('calculator')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'calculator' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#8E917A] hover:text-[#5A5A40]'}`}>
                <CalcIcon className="w-4 h-4" /> Calculator
              </button>
              <button onClick={() => setActiveTab('documentation')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'documentation' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#8E917A] hover:text-[#5A5A40]'}`}>
                <FileText className="w-4 h-4" /> Documentation
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <AnimatePresence mode="wait">
            {activeTab === 'calculator' ? (
              <motion.div key="calculator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Calculator />
              </motion.div>
            ) : (
              <motion.div key="doc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#FCFAF2] p-8 md:p-12 rounded-2xl shadow-sm border border-[#D6D3C1]">
                <h2 className="text-3xl font-serif font-bold text-[#5A5A40] mb-6">How it works</h2>
                <p className="text-[#43413B] leading-relaxed">
                  Enter up to 3 or more numbers in Binary, Octal, Decimal, or Hexadecimal. The app converts them behind the scenes, executes your math operation, and stores the history persistently to Supabase!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </CalculatorProvider>
  );
}