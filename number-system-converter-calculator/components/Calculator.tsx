'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, X, Divide, Trash2, ArrowRight, Clock, Copy, Check } from 'lucide-react';
import { Base, isValidNumber, toDecimal, fromDecimal } from '@/lib/converter';
import { useCalculatorContext, Operation } from './CalculatorContext';

function CopyButton({ text, className = '', dark = false }: { text: string; className?: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };
  return (
    <button onClick={handleCopy} className={`p-1 rounded transition-all ${copied ? 'bg-green-100 text-green-700' : dark ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white' : 'bg-[#F2F1EB] hover:bg-[#E8E6D8] text-[#8E917A] hover:text-[#5A5A40]'} ${className}`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const BASE_NAMES: Record<number, string> = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };
const OP_SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

export default function Calculator() {
  const { inputs, setInputs, operation, setOperation, results, setResults, history, addCalculationToHistory } = useCalculatorContext();

  const handleInputChange = (id: string, field: 'base' | 'value', val: any) => {
    setInputs(current => current.map(input => {
      if (input.id === id) {
        const updated = { ...input, [field]: val };
        updated.error = !updated.value.trim() ? undefined : (!isValidNumber(updated.value, updated.base) ? `Invalid ${BASE_NAMES[updated.base]}` : undefined);
        return updated;
      }
      return input;
    }));
    setResults(null);
  };

  const addInput = () => setInputs(current => [...current, { id: Date.now().toString(), base: 10, value: '' }]);
  const removeInput = (id: string) => {
    if (inputs.length <= 3) return;
    setInputs(current => current.filter(input => input.id !== id));
    setResults(null);
  };

  const calculate = () => {
    let hasError = false;
    const validatedInputs = inputs.map(input => {
      const val = input.value.trim();
      if (!val) { hasError = true; return { ...input, error: 'Value required' }; }
      if (!isValidNumber(val, input.base)) { hasError = true; return { ...input, error: `Invalid ${BASE_NAMES[input.base]}` }; }
      return { ...input, error: undefined };
    });
    setInputs(validatedInputs);
    if (hasError) return;

    const parsedValues = validatedInputs.map(input => ({ value: input.value.trim(), base: input.base, decimal: toDecimal(input.value, input.base) }));
    let total = parsedValues[0].decimal;
    for (let i = 1; i < parsedValues.length; i++) {
      const current = parsedValues[i].decimal;
      if (operation === '+') total += current;
      if (operation === '-') total -= current;
      if (operation === '*') total *= current;
      if (operation === '/') total = total / current;
    }

    const expr = parsedValues.map(p => `(${p.value})_${p.base}`).join(` ${OP_SYMBOLS[operation]} `);
    const newResult = { originalValues: parsedValues, finalValue: total, expression: `${expr} = (${fromDecimal(total, 10)})_10` };
    setResults(newResult);
    addCalculationToHistory(newResult, operation);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6 bg-[#FCFAF2] p-6 md:p-8 rounded-2xl shadow-sm border border-[#D6D3C1]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#5A5A40] mb-1">Numbers to Calculate</h2>
            <p className="text-[#8E917A] text-sm uppercase tracking-widest font-medium mb-6">Enter at least 3 numbers and specify their bases.</p>
          </div>
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {inputs.map((input, index) => (
                <motion.div key={input.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#FCFAF2] rounded-2xl border border-[#D6D3C1] p-5 shadow-sm flex flex-col relative group">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs uppercase font-bold tracking-tighter text-[#8E917A]">Number Input {String(index + 1).padStart(2, '0')}</span>
                    <div className="flex items-center gap-2">
                      <select value={input.base} onChange={(e) => handleInputChange(input.id, 'base', Number(e.target.value))} className="bg-[#F2F1EB] text-[10px] px-2 py-0.5 rounded border border-[#D6D3C1] font-bold uppercase text-[#5A5A40] outline-none focus:ring-1 focus:ring-[#5A5A40]">
                        <option value={2}>Binary</option><option value={8}>Octal</option><option value={10}>Decimal</option><option value={16}>Hexadecimal</option>
                      </select>
                      <button onClick={() => removeInput(input.id)} disabled={inputs.length <= 3} className={`p-1 rounded transition-colors ${inputs.length <= 3 ? 'opacity-30 cursor-not-allowed text-[#8E917A]' : 'text-[#8E917A] hover:text-red-600 hover:bg-[#E8E6D8]'}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="w-full relative flex-grow">
                    <input type="text" value={input.value} onChange={(e) => handleInputChange(input.id, 'value', e.target.value)} placeholder="0" className={`bg-transparent text-3xl font-mono focus:outline-none mb-1 w-full border-b border-dashed pb-2 transition-all ${input.error ? 'border-red-400 text-red-600' : 'border-[#D6D3C1] text-[#5A5A40] focus:border-[#5A5A40]'}`} />
                    {input.error && <span className="absolute -bottom-5 left-0 text-[10px] uppercase font-bold text-red-600">{input.error}</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button onClick={addInput} className="flex items-center gap-2 text-sm font-bold text-[#8E917A] hover:text-[#5A5A40] bg-[#F2F1EB] hover:bg-[#E8E6D8] px-4 py-2 rounded-lg transition-colors mt-4 border border-[#D6D3C1]"><Plus className="w-4 h-4" /> Add Input</button>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FCFAF2] p-6 md:p-8 rounded-2xl shadow-sm border border-[#D6D3C1]">
            <h2 className="text-xl font-serif font-bold text-[#5A5A40] mb-6">Arithmetic Operation</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {(['+', '-', '*', '/'] as Operation[]).map((op) => (
                <button key={op} onClick={() => { setOperation(op); setResults(null); }} className={`flex items-center justify-center gap-3 py-3 rounded-xl border transition-all ${operation === op ? 'border-[#5A5A40] bg-[#5A5A40] text-white font-bold' : 'border-[#D6D3C1] bg-white text-[#8E917A]'}`}>
                  <span className="text-xl font-mono font-bold">{OP_SYMBOLS[op]}</span>
                  <span className="text-xs uppercase font-bold tracking-widest">{op === '+' ? 'Add' : op === '-' ? 'Subtract' : op === '*' ? 'Multiply' : 'Divide'}</span>
                </button>
              ))}
            </div>
            <button onClick={calculate} className="w-full flex items-center justify-center gap-2 py-4 bg-[#5A5A40] hover:bg-[#43413B] text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-sm active:scale-[0.98]">
              Calculate Results <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#E8E6D8] p-6 md:p-8 rounded-2xl shadow-inner border border-[#D6D3C1]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { base: 2, label: 'Binary', color: 'text-[#5A5A40]', bg: 'bg-white' },
                { base: 8, label: 'Octal', color: 'text-[#5A5A40]', bg: 'bg-white' },
                { base: 10, label: 'Decimal', color: 'text-white', bg: 'bg-[#5A5A40]' },
                { base: 16, label: 'Hex', color: 'text-[#5A5A40]', bg: 'bg-white' }
              ].map((res) => (
                <div key={res.base} className={`${res.bg} rounded-xl p-5 shadow-sm relative group`}>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={fromDecimal(results.finalValue, res.base as Base)} dark={res.base === 10} /></div>
                  <span className={`text-[10px] uppercase font-bold mb-2 block tracking-widest ${res.base === 10 ? 'text-[#D6D3C1]' : 'text-[#8E917A]'}`}>{res.label}</span>
                  <span className={`font-mono text-2xl break-all uppercase ${res.base === 10 ? 'text-4xl font-bold text-white' : res.color}`}>{fromDecimal(results.finalValue, res.base as Base)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {history.length > 0 && (
        <div className="bg-[#FCFAF2] p-6 md:p-8 rounded-2xl shadow-sm border border-[#D6D3C1] mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-[#8E917A]" />
            <h2 className="text-xl font-serif font-bold text-[#5A5A40]">Recent Calculations</h2>
          </div>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row justify-between p-4 bg-white border border-[#D6D3C1] rounded-xl gap-4">
                <span className="font-mono text-sm text-[#43413B]">{item.expression.replace(/_(\d+)/g, '')}</span>
                <span className="font-mono text-lg font-bold text-[#5A5A40]">{item.finalValue} (Dec)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}