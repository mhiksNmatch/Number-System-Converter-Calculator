'use client';

import React, { useState } from 'react';
import Mermaid from '@/components/Mermaid';
import Calculator from '@/components/Calculator';
import { CalculatorProvider } from '@/components/CalculatorContext';
import { FileText, Calculator as CalcIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'documentation'>('calculator');

  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-[#F2F1EB] text-[#43413B] font-sans selection:bg-[#E8E6D8]">
        <header className="bg-transparent border-b border-[#D6D3C1] py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#5A5A40] tracking-tight">Number System Converter</h1>
            <p className="text-[#8E917A] text-sm uppercase tracking-widest font-medium mt-1">Multi-base arithmetic calculator</p>
          </div>
          
          <div className="flex items-center p-1 bg-[#E8E6D8] rounded-lg border border-[#D6D3C1]">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-[#5A5A40] text-white shadow-sm' 
                  : 'text-[#8E917A] hover:text-[#5A5A40]'
              }`}
            >
              <CalcIcon className="w-4 h-4" />
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'documentation' 
                  ? 'bg-[#5A5A40] text-white shadow-sm' 
                  : 'text-[#8E917A] hover:text-[#5A5A40]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documentation
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' ? (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Calculator />
            </motion.div>
          ) : (
            <motion.div
              key="documentation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FCFAF2] p-8 md:p-10 rounded-2xl shadow-sm border border-[#D6D3C1] max-w-4xl mx-auto prose prose-neutral prose-headings:text-[#5A5A40] text-[#43413B]"
            >
              <h2>System Requirements</h2>
              <ul>
                <li><strong>Environment:</strong> Modern Web Browser with JavaScript enabled.</li>
                <li><strong>Input Handling:</strong> Supports dynamic addition of minimum 3 operands.</li>
                <li><strong>Supported Bases:</strong> Binary (2), Octal (8), Decimal (10), Hexadecimal (16).</li>
                <li><strong>Operations:</strong> Addition (+), Subtraction (-), Multiplication (*), Division (/).</li>
                <li><strong>Validation:</strong> Real-time regex-based input validation preventing invalid characters for the selected base.</li>
              </ul>

              <h2>Algorithm / Pseudocode</h2>
              <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`1. Initialize application state:
                - inputs = [{base: 2, value: ''}, {base: 8, value: ''}, {base: 10, value: ''}]
                - operation = '+'
                2. ON calculate_button_click:
                  a. FOREACH input in inputs:
                      IF value does not match regex for selected base:
                        SHOW validation error
                        RETURN
                  b. Initialize parsed_values = []
                  c. FOREACH input in inputs:
                      decimal_val = PARSE_INT(input.value, input.base)
                      ADD {original, base, decimal_val} TO parsed_values
                  d. total = parsed_values[0].decimal_val
                  e. FOR i = 1 TO parsed_values.length - 1:
                      current = parsed_values[i].decimal_val
                      IF operation == '+': total = total + current
                      IF operation == '-': total = total - current
                      IF operation == '*': total = total * current
                      IF operation == '/': total = total / current
                  f. Generate final results:
                      bin_res = TO_BASE(total, 2)
                      oct_res = TO_BASE(total, 8)
                      dec_res = TO_BASE(total, 10)
                      hex_res = TO_BASE(total, 16)
                  g. DISPLAY individual conversions and final results`}
              </pre>

              <h2>Flowchart</h2>
              <div className="bg-[#F2F1EB] p-4 rounded-lg border border-[#D6D3C1] my-4 text-center text-sm font-mono text-[#8E917A]">
                (Render via Mermaid.js)
                <br/>
                <br/>
                graph TD<br/>
                A[Start] --&gt; B[Initialize 3 inputs]<br/>
                B --&gt; C[User enters values and selects bases]<br/>
                C --&gt; D[User selects arithmetic operation]<br/>
                D --&gt; E{"{ Click Calculate? }"}<br/>
                E -- Yes --&gt; F{"{ Validate Inputs }"}<br/>
                F -- Invalid --&gt; G[Show Error] --&gt; C<br/>
                F -- Valid --&gt; H[Convert each input to Decimal]<br/>
                H --&gt; I[Display Individual Conversions]<br/>
                I --&gt; J[Apply Arithmetic Operation]<br/>
                J --&gt; K[Convert Result to all Bases]<br/>
                K --&gt; L[Display Expression and Results]<br/>
                L --&gt; M[End]
              </div>

              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="bg-[#5A5A40] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  System Architecture Flowchart
                </h3>
                <p className="mb-4">
                  Below is the visual logic flow of how the Number System Converter processes your inputs, executes the math, and saves to the database.
                </p>

                <Mermaid chart={`
                  graph TD
                    A[User Enters N Numbers & Bases] --> B{Validate Inputs?}
                    B -- Invalid --> C[Show Error Message]
                    B -- Valid --> D[Convert all inputs to Base 10]
                    D --> E[Apply Selected Arithmetic Operation]
                    E --> F[Calculate Final Decimal Total]
                    F --> G[Convert Total to Binary]
                    F --> H[Convert Total to Octal]
                    F --> I[Convert Total to Hexadecimal]
                    G --> J[Display Results UI]
                    H --> J
                    I --> J
                    F --> J
                    J --> K[(Save to Supabase Database)]
                `} />
              </section>

              <h2>Test Cases</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-[#D6D3C1]">
                  <thead className="bg-[#E8E6D8] text-[#5A5A40]">
                    <tr>
                      <th className="p-3 border border-[#D6D3C1]">Test Setup</th>
                      <th className="p-3 border border-[#D6D3C1]">Operation</th>
                      <th className="p-3 border border-[#D6D3C1]">Expected Decimal</th>
                      <th className="p-3 border border-[#D6D3C1]">Expected Hexadecimal</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#43413B]">
                    <tr>
                      <td className="p-3 border border-[#D6D3C1]">BIN(1010) + OCT(12) + DEC(10)</td>
                      <td className="p-3 border border-[#D6D3C1]">Addition</td>
                      <td className="p-3 border border-[#D6D3C1]">10 + 10 + 10 = 30</td>
                      <td className="p-3 border border-[#D6D3C1]">1E</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#D6D3C1]">BIN(1100) + DEC(12) + HEX(C)</td>
                      <td className="p-3 border border-[#D6D3C1]">Addition</td>
                      <td className="p-3 border border-[#D6D3C1]">12 + 12 + 12 = 36</td>
                      <td className="p-3 border border-[#D6D3C1]">24</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#D6D3C1]">OCT(20) + DEC(16) + HEX(10)</td>
                      <td className="p-3 border border-[#D6D3C1]">Addition</td>
                      <td className="p-3 border border-[#D6D3C1]">16 + 16 + 16 = 48</td>
                      <td className="p-3 border border-[#D6D3C1]">30</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#D6D3C1]">BIN(1111) + OCT(17) + HEX(F)</td>
                      <td className="p-3 border border-[#D6D3C1]">Addition</td>
                      <td className="p-3 border border-[#D6D3C1]">15 + 15 + 15 = 45</td>
                      <td className="p-3 border border-[#D6D3C1]">2D</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#D6D3C1]">HEX(20) - OCT(10) - BIN(100)</td>
                      <td className="p-3 border border-[#D6D3C1]">Subtraction</td>
                      <td className="p-3 border border-[#D6D3C1]">32 - 8 - 4 = 20</td>
                      <td className="p-3 border border-[#D6D3C1]">14</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </CalculatorProvider>
  );
}
