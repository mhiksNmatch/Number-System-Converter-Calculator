'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, X, Divide, Trash2, ArrowRight, Clock, Copy, Check } from 'lucide-react';
import { Base, isValidNumber, toDecimal, fromDecimal } from '@/lib/converter';
import { useCalculatorContext, Operation, InputRow, HistoryItem } from './CalculatorContext';
import ComplementInputCard from './ComplementInputCard';
import ComplementSubtractionPanel from './ComplementSubtractionPanel';

function CopyButton({ text, className = '', dark = false }: { text: string; className?: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded transition-all ${
        copied 
          ? 'bg-green-100 text-green-700' 
          : dark 
            ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white' 
            : 'bg-[#F2F1EB] hover:bg-[#E8E6D8] text-[#8E917A] hover:text-[#5A5A40]'
      } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const BASE_NAMES: Record<number, string> = {
  2: 'Binary',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal'
};

const OP_SYMBOLS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

const OP_ICONS = {
  '+': <Plus className="w-5 h-5" />,
  '-': <Minus className="w-5 h-5" />,
  '*': <X className="w-5 h-5" />,
  '/': <Divide className="w-5 h-5" />
};

const formatExpressionValue = (part: string) => {
  const subs: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };

  return part.replace(/_(\d+)/g, (_match: string, p1: string) =>
    p1.split('').map((c: string) => subs[c] ?? c).join('')
  );
};

export default function Calculator() {
  const {
    inputs, setInputs,
    operation, setOperation,
    results, setResults,
    history, addCalculationToHistory
  } = useCalculatorContext();

  // Validate on change
  const handleInputChange = (id: string, field: 'base' | 'value', val: any) => {
    setInputs(current =>
      current.map(input => {
        if (input.id === id) {
          const updated = { ...input, [field]: val };
          // Clear error if value is empty
          if (!updated.value.trim()) {
            updated.error = undefined;
          } else {
            // Validate using isolated engine
            if (!isValidNumber(updated.value, updated.base)) {
              updated.error = `Invalid ${BASE_NAMES[updated.base]} number`;
            } else {
              updated.error = undefined;
            }
          }
          return updated;
        }
        return input;
      })
    );
    setResults(null);
  };

  const addInput = () => {
    setInputs(current => [
      ...current,
      { id: Date.now().toString(), base: 10, value: '' }
    ]);
  };

  const removeInput = (id: string) => {
    if (inputs.length <= 3) return;
    setInputs(current => current.filter(input => input.id !== id));
    setResults(null);
  };

  const calculate = () => {
    // 1. Validation check
    let hasError = false;
    const validatedInputs = inputs.map(input => {
      const val = input.value.trim();
      if (!val) {
        hasError = true;
        return { ...input, error: 'Value is required' };
      }
      if (!isValidNumber(val, input.base)) {
        hasError = true;
        return { ...input, error: `Invalid ${BASE_NAMES[input.base]} number` };
      }
      return { ...input, error: undefined };
    });

    setInputs(validatedInputs);
    if (hasError) return;

    // 2. Parse values to decimal using the engine
    const parsedValues = validatedInputs.map(input => {
      const decimalValue = toDecimal(input.value, input.base);
      return {
        value: input.value.trim(),
        base: input.base,
        decimal: decimalValue
      };
    });

    // 3. Perform Arithmetic
    let total = parsedValues[0].decimal;
    for (let i = 1; i < parsedValues.length; i++) {
      const current = parsedValues[i].decimal;
      if (operation === '+') total += current;
      if (operation === '-') total -= current;
      if (operation === '*') total *= current;
      if (operation === '/') total = total / current; // Allow decimals
    }

    // 4. Construct Expression String
    const expr = parsedValues
      .map(p => `(${p.value})_${p.base}`)
      .join(` ${OP_SYMBOLS[operation]} `);

    const newResult = {
      originalValues: parsedValues,
      finalValue: total,
      expression: `${expr} = (${fromDecimal(total, 10)})`
    };

    setResults(newResult);
    addCalculationToHistory(newResult, operation);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      {/* Calculation setup */}
      <div className="rounded-xl border border-[#D6D3C1] bg-[#FCFAF2] p-5 shadow-sm md:p-7">
        <div className="mb-6 border-b border-[#D6D3C1] pb-4">
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#5A5A40]">Numbers and operation</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E917A]">Enter at least 3 numbers and specify their bases.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Number inputs */}
          <div className="space-y-6 lg:col-span-7">

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {inputs.map((input, index) => (
                <motion.div
                  key={input.id}
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col rounded-xl border border-[#D6D3C1] bg-[#FCFAF2] p-4 shadow-sm focus-within:border-[#5A5A40] focus-within:ring-2 focus-within:ring-[#E8E6D8]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E917A]">Number Input {String(index + 1).padStart(2, '0')}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={input.base}
                        onChange={(e) => handleInputChange(input.id, 'base', Number(e.target.value))}
                        className="h-8 rounded-lg border border-[#D6D3C1] bg-[#F2F1EB] px-2 text-[10px] font-bold uppercase text-[#5A5A40] outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E8E6D8]"
                      >
                        <option value={2}>Binary</option>
                        <option value={8}>Octal</option>
                        <option value={10}>Decimal</option>
                        <option value={16}>Hexadecimal</option>
                      </select>
                      <button
                        onClick={() => removeInput(input.id)}
                        disabled={inputs.length <= 3}
                        className={`p-1 rounded transition-colors ${
                          inputs.length <= 3 
                            ? 'opacity-30 cursor-not-allowed text-[#8E917A]' 
                            : 'text-[#8E917A] hover:text-red-600 hover:bg-[#E8E6D8]'
                        }`}
                        title={inputs.length <= 3 ? "Minimum 3 inputs required" : "Remove input"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full relative flex-grow">
                    <input
                      type="text"
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, 'value', e.target.value)}
                      placeholder={`0`}
                      className={`w-full border-b border-dashed bg-transparent pb-2 font-mono text-3xl focus:outline-none ${
                        input.error 
                          ? 'border-red-400 text-red-600' 
                            : 'border-[#D6D3C1] text-[#5A5A40] focus:border-[#5A5A40]'
                      }`}
                    />
                    {input.error && (
                      <span className="absolute -bottom-5 left-0 text-[10px] uppercase font-bold text-red-600">
                        {input.error}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={addInput}
            className="mt-4 flex items-center gap-2 rounded-lg border border-[#D6D3C1] bg-[#F2F1EB] px-4 py-2.5 text-sm font-bold text-[#8E917A] transition-colors hover:border-[#5A5A40] hover:bg-[#E8E6D8] hover:text-[#5A5A40]"
          >
            <Plus className="w-4 h-4" />
            Add Input
          </button>

          </div>

          {/* Operation controls */}
          <div className="rounded-xl border border-[#D6D3C1] bg-white p-5 lg:col-span-5">
            <h3 className="mb-5 font-serif text-xl font-bold text-[#5A5A40]">Arithmetic Operation</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {(['+', '-', '*', '/'] as Operation[]).map((op) => (
                <button
                  key={op}
                  onClick={() => { setOperation(op); setResults(null); }}
                    className={`flex min-h-12 items-center justify-center gap-3 rounded-lg border px-3 py-3 transition-all ${
                    operation === op
                      ? 'border-[#5A5A40] bg-[#5A5A40] font-bold text-white shadow-sm'
                      : 'border-[#D6D3C1] bg-white font-medium text-[#8E917A] hover:border-[#8E917A] hover:text-[#5A5A40]'
                  }`}
                >
                  <span className="text-xl font-mono font-bold">
                    {OP_SYMBOLS[op]}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-widest">{op === '+' ? 'Add' : op === '-' ? 'Subtract' : op === '*' ? 'Multiply' : 'Divide'}</span>
                </button>
              ))}
            </div>

            <button
              onClick={calculate}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5A5A40] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all hover:bg-[#43413B] active:scale-[0.98]"
            >
              Calculate Results
              <ArrowRight className="w-5 h-5" />
            </button>

            {history.length > 0 && (
              <div className="mt-8 border-t border-[#D6D3C1] pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#8E917A]" />
                  <h4 className="font-serif text-lg font-bold text-[#5A5A40]">Recent Calculations</h4>
                </div>

                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-[#D6D3C1] bg-[#FCFAF2] p-3 hover:border-[#8E917A] md:flex-row md:items-center md:justify-between">
                      <div className="overflow-x-auto whitespace-nowrap font-mono text-xs text-[#43413B] scrollbar-hide">
                        {item.expression.split('=').map((part, i) => (
                          i === 0 ? (
                            <span key={i}>{formatExpressionValue(part)}</span>
                          ) : (
                            <span key={i} className="font-bold text-[#5A5A40]">{' = '}{part.trim()}</span>
                          )
                        ))}
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold uppercase text-[#8E917A]">Hex</span>
                          <span className="font-mono text-xs uppercase text-[#5A5A40]">{fromDecimal(item.finalValue, 16)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold uppercase text-[#8E917A]">Binary</span>
                          <span className="font-mono text-xs text-[#5A5A40]">{fromDecimal(item.finalValue, 2)}</span>
                        </div>
                        <div className="h-7 w-px bg-[#D6D3C1]" />
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold uppercase text-[#5A5A40]">Decimal</span>
                          <span className="font-mono text-base font-bold leading-none text-[#5A5A40]">{item.finalValue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arithmetic expression */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 rounded-xl border border-[#D6D3C1] bg-[#E8E6D8] p-5 shadow-sm md:p-7"
          >
            <div className="rounded-lg border border-[#D6D3C1] bg-[#FCFAF2] px-5 py-5 text-center shadow-sm md:px-8">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#8E917A]">Arithmetic Expression</span>
              <div className="overflow-x-auto whitespace-nowrap pb-1 font-mono text-xl tracking-wide text-[#43413B] md:text-2xl">
                {results.expression.split('=').map((part: string, i: number) => (
                  i === 0 ? (
                    <span key={i}>{formatExpressionValue(part)}</span>
                  ) : (
                    <span key={i} className="font-bold text-[#5A5A40]">{' = '}{part.trim()}</span>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Values */}
      <div className="order-3 rounded-xl border border-[#D6D3C1] bg-[#FCFAF2] p-5 shadow-sm md:p-7">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#D6D3C1] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E917A]">Values</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#5A5A40]">Complement values</h2>
          </div>
          <span className="hidden text-xs text-[#8E917A] sm:block">Calculated from each input base</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {inputs.map((input, index) => (
            <ComplementInputCard
              key={input.id}
              label={`Value ${index + 1}`}
              base={input.base}
              value={input.value}
              digits={Math.max(1, input.value.replace(/^-/, '').length || 1)}
              onChange={(nextValue) => handleInputChange(input.id, 'value', nextValue)}
            />
          ))}
        </div>
      </div>

      <div className="order-4 mt-8">
        <ComplementSubtractionPanel inputs={inputs} />
      </div>

      {/* Bottom Section: Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 -mt-8 overflow-hidden rounded-xl border border-t-0 border-[#D6D3C1] bg-[#E8E6D8] p-6 shadow-inner md:p-8"
          >
            <div className="flex flex-col gap-8">
              
              {/* Final Result Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { base: 2, label: 'Result Binary', color: 'border-l-4 border-[#5A5A40] text-[#5A5A40]', bg: 'bg-white' },
                  { base: 8, label: 'Result Octal', color: 'border-l-4 border-[#8E917A] text-[#5A5A40]', bg: 'bg-white' },
                  { base: 10, label: 'Result Decimal', color: 'text-white', bg: 'bg-[#5A5A40] transform md:scale-105 shadow-md border-0' },
                  { base: 16, label: 'Result Hex', color: 'border-l-4 border-[#8E917A] text-[#5A5A40]', bg: 'bg-white' }
                ].map((res) => (
                  <div key={res.base} className={`${res.bg} rounded-xl p-5 ${res.bg === 'bg-white' ? res.color.split(' ').slice(0, 2).join(' ') : ''} shadow-sm flex flex-col justify-center relative group`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={fromDecimal(results.finalValue, res.base as Base)} dark={res.base === 10} />
                    </div>
                    <span className={`text-[10px] uppercase font-bold mb-2 tracking-widest ${res.base === 10 ? 'text-[#D6D3C1]' : 'text-[#8E917A]'}`}>{res.label}</span>
                    <span className={`font-mono ${res.base === 10 ? 'text-4xl font-bold text-white' : 'text-2xl ' + res.color.split(' ')[2]} break-all leading-none uppercase`}>
                      {fromDecimal(results.finalValue, res.base as Base)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Individual Conversions Detail */}
              <div className="mt-4 border-t border-[#D6D3C1] pt-6">
                <span className="text-[10px] uppercase font-bold text-[#8E917A] block mb-4 text-center tracking-widest">Individual Base Conversions</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.originalValues.map((val: any, idx: number) => (
                    <div key={idx} className="bg-[#FCFAF2] rounded-xl border border-[#D6D3C1] p-4 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-3 border-b border-[#D6D3C1] pb-2">
                         <span className="text-[10px] uppercase font-bold tracking-tighter text-[#8E917A]">Input {String(idx + 1).padStart(2, '0')}</span>
                         <span className="font-mono text-[#5A5A40] text-lg font-bold truncate max-w-[120px]">{val.value} <span className="text-[10px] font-sans text-[#8E917A] bg-[#F2F1EB] px-1 py-0.5 rounded border border-[#D6D3C1] align-middle">Base {val.base}</span></span>
                      </div>
                      <div className="space-y-1 mt-auto">
                        <div className="flex justify-between text-xs border-b border-[#F2F1EB] pb-1 items-center group/row">
                          <span className="text-[#8E917A]">Binary</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#5A5A40] truncate max-w-[100px]">{fromDecimal(val.decimal, 2)}</span>
                            <CopyButton text={fromDecimal(val.decimal, 2)} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs border-b border-[#F2F1EB] pb-1 items-center group/row">
                          <span className="text-[#8E917A]">Octal</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#5A5A40] truncate max-w-[100px]">{fromDecimal(val.decimal, 8)}</span>
                            <CopyButton text={fromDecimal(val.decimal, 8)} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs border-b border-[#F2F1EB] pb-1 font-bold bg-[#E8E6D8] rounded px-1 items-center group/row">
                          <span className="text-[#5A5A40]">Decimal</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono truncate max-w-[100px]">{val.decimal}</span>
                            <CopyButton text={val.decimal.toString()} className="bg-[#FCFAF2] opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs border-b border-[#F2F1EB] pb-1 items-center group/row">
                          <span className="text-[#8E917A]">Hexadecimal</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#5A5A40] uppercase truncate max-w-[100px]">{fromDecimal(val.decimal, 16)}</span>
                            <CopyButton text={fromDecimal(val.decimal, 16)} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
