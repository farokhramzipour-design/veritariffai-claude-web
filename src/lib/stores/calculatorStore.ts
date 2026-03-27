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
  sanctionsCheck: boolean;
  importerName: string;
  exporterName: string;
  extractedImporterName: string;
  extractedExporterName: string;
  setStep1: (data: Partial<Step1Data>) => void;
  setAdvanced: (data: { freightCost?: MoneyInput | null; insuranceCost?: MoneyInput | null }) => void;
  setSanctions: (data: { sanctionsCheck?: boolean; importerName?: string; exporterName?: string }) => void;
  setExtractedParties: (data: { extractedImporterName?: string; extractedExporterName?: string }) => void;
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
      sanctionsCheck: false,
      importerName: '',
      exporterName: '',
      extractedImporterName: '',
      extractedExporterName: '',

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
      setAdvanced: (data) => set((state) => ({
        freightCost: data.freightCost !== undefined ? data.freightCost : state.freightCost,
        insuranceCost: data.insuranceCost !== undefined ? data.insuranceCost : state.insuranceCost,
      })),
      setSanctions: (data) => set((state) => ({
        sanctionsCheck: data.sanctionsCheck !== undefined ? data.sanctionsCheck : state.sanctionsCheck,
        importerName: data.importerName !== undefined ? data.importerName : state.importerName,
        exporterName: data.exporterName !== undefined ? data.exporterName : state.exporterName,
      })),
      setExtractedParties: (data) => set((state) => ({
        extractedImporterName: data.extractedImporterName !== undefined ? data.extractedImporterName : state.extractedImporterName,
        extractedExporterName: data.extractedExporterName !== undefined ? data.extractedExporterName : state.extractedExporterName,
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
        sanctionsCheck: false,
        importerName: '',
        exporterName: '',
        extractedImporterName: '',
        extractedExporterName: '',
      }),
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'calculator-storage', // name of the item in the storage (must be unique)
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);
