'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Base } from '@/lib/converter';

export type Operation = '+' | '-' | '*' | '/';

export interface InputRow {
  id: string;
  base: Base;
  value: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  operation: Operation;
  originalValues: { value: string; base: Base; decimal: number }[];
  finalValue: number;
  expression: string;
}

interface CalculatorState {
  inputs: InputRow[];
  setInputs: React.Dispatch<React.SetStateAction<InputRow[]>>;
  operation: Operation;
  setOperation: React.Dispatch<React.SetStateAction<Operation>>;
  results: {
    originalValues: { value: string; base: Base; decimal: number }[];
    finalValue: number;
    expression: string;
  } | null;
  setResults: React.Dispatch<React.SetStateAction<any>>;
  history: HistoryItem[];
  addCalculationToHistory: (newResult: any, operation: Operation) => void;
  isLoadingHistory: boolean;
}

const CalculatorContext = createContext<CalculatorState | undefined>(undefined);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [inputs, setInputs] = useState<InputRow[]>([
    { id: '1', base: 2, value: '' },
    { id: '2', base: 8, value: '' },
    { id: '3', base: 10, value: '' }
  ]);
  const [operation, setOperation] = useState<Operation>('+');
  const [results, setResults] = useState<{
    originalValues: { value: string; base: Base; decimal: number }[];
    finalValue: number;
    expression: string;
  } | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const addCalculationToHistory = useCallback(async (newResult: any, op: Operation) => {
    const newItem: HistoryItem = {
      ...newResult,
      id: Date.now().toString(),
      timestamp: Date.now(),
      operation: op
    };

    setHistory(prev => [newItem, ...prev].slice(0, 5));
    setIsLoadingHistory(false);
  }, []);

  return (
    <CalculatorContext.Provider value={{
      inputs, setInputs,
      operation, setOperation,
      results, setResults,
      history, addCalculationToHistory, isLoadingHistory
    }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
}
