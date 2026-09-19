'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Base } from '@/lib/converter';
import { createClient } from '@/utils/supabase/client';

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

const isSupabaseAccessError = (message?: string) => {
  if (!message) return false;
  return /row-level security|permission denied|does not exist|not found/i.test(message);
};

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

  // Stable Supabase client instance for client-side usage
  const [supabase] = useState(() => createClient());

  // Load history from Supabase on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) {
          if (isSupabaseAccessError(error.message)) {
            console.warn('Supabase history unavailable because the table is protected by RLS or missing. Falling back to local-only history.', error.message);
          } else {
            console.warn('Supabase fetch error:', error.message);
          }
        } else if (data) {
          setHistory(data as HistoryItem[]);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchHistory();
  }, [supabase]);

  const addCalculationToHistory = useCallback(async (newResult: any, op: Operation) => {
    const newItem: HistoryItem = {
      ...newResult,
      id: Date.now().toString(),
      timestamp: Date.now(),
      operation: op
    };

    // Optimistic UI update
    setHistory(prev => [newItem, ...prev].slice(0, 5));

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('calculations')
        .insert([{
          id: newItem.id,
          timestamp: newItem.timestamp,
          operation: newItem.operation,
          originalValues: newItem.originalValues,
          finalValue: newItem.finalValue,
          expression: newItem.expression
        }]);
        
      if (error) {
        if (isSupabaseAccessError(error.message)) {
          console.warn('Supabase insert blocked by RLS or missing table. Local history remains available.', error.message);
        } else {
          console.warn('Failed to insert calculation:', error.message);
        }
      }
    } catch (err) {
      console.error('Failed to sync with Supabase:', err);
    }
  }, [supabase]);

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
