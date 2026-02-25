import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Placeholder types - these would be defined in a types directory
type MoneyInput = { amount: string; currency: string; };
type ShipmentLineInput = { 
  hs_code: string; 
  description: string; 
  value?: string;
  currency?: string;
  confidence?: number;
  hsDescription?: string;
};
type Step1Data = { 
  jurisdiction: 'UK' | 'EU' | null; 
  originCountry: string | null; 
  destinationCountry: string | null;
  incoterm: string | null;
};

interface CalculatorState {
  jurisdiction: 'UK' | 'EU' | null;
  originCountry: string | null;
  destinationCountry: string | null;
  incoterm: string | null;
  freightCost: MoneyInput | null;
  insuranceCost: MoneyInput | null;
  lines: ShipmentLineInput[];
  currentStep: 1 | 2 | 3;
  setStep1: (data: Partial<Step1Data>) => void;
  addLine: () => void;
  updateLine: (index: number, updates: Partial<ShipmentLineInput>) => void;
  removeLine: (index: number) => void;
  reset: () => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      // Initial state
      jurisdiction: 'UK',
      originCountry: null,
      destinationCountry: 'GB',
      incoterm: null,
      freightCost: null,
      insuranceCost: null,
      lines: [{ hs_code: '', description: '', value: '', currency: 'GBP' }],
      currentStep: 1,

      // Actions
      setStep1: (data) => set((state) => ({ ...state, ...data })),
      addLine: () => set((state) => ({ lines: [...state.lines, { hs_code: '', description: '', value: '', currency: 'GBP' }] })),
      updateLine: (index, updates) => set((state) => {
        const newLines = [...state.lines];
        newLines[index] = { ...newLines[index], ...updates };
        return { lines: newLines };
      }),
      removeLine: (index) => set((state) => ({
        lines: state.lines.filter((_, i) => i !== index),
      })),
      reset: () => set({
        jurisdiction: 'UK',
        originCountry: null,
        destinationCountry: 'GB',
        incoterm: null,
        freightCost: null,
        insuranceCost: null,
        lines: [{ hs_code: '', description: '', value: '', currency: 'GBP' }],
        currentStep: 1,
      }),
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'calculator-storage', // name of the item in the storage (must be unique)
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);
