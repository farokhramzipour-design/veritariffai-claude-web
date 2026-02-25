import React from 'react';
import { HSCodeField } from './HSCodeField';
import { CountrySelect } from './CountrySelect';
import { IncotermsSelect } from './IncotermsSelect';
import { CurrencySelect } from './CurrencySelect';
import { useCalculatorStore } from '@/lib/stores/calculatorStore';

const FieldWrapper = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block font-mono text-[10px] text-[var(--muted2)] tracking-[0.1em] uppercase mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const TextInput = ({ 
  isAiFilled, 
  placeholder, 
  value, 
  onChange 
}: { 
  isAiFilled?: boolean, 
  placeholder?: string, 
  value?: string, 
  onChange?: (val: string) => void 
}) => (
  <div className="relative">
    <input
      type="text"
      className={`w-full bg-[var(--bg)] border rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] transition-all
        ${isAiFilled ? 'border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.03)]' : 'border-[var(--border)]'}
        focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none
      `}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
    {isAiFilled && (
      <div className="absolute top-[-8px] right-2 bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] text-[var(--cyan)] font-mono text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded">
        AI
      </div>
    )}
  </div>
);


export const FieldGrid = () => {
  const { 
    originCountry, 
    destinationCountry, 
    incoterm, 
    lines, 
    setStep1, 
    updateLine 
  } = useCalculatorStore();

  // We are working with the first line for now as per the current UI
  const currentLine = lines[0] || { hs_code: '', description: '', value: '', currency: 'GBP' };

  return (
    <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
      <FieldWrapper label="Product Description">
        <TextInput 
          isAiFilled={!!currentLine.description} 
          placeholder="e.g., Leather shoes" 
          value={currentLine.description}
          onChange={(val) => updateLine(0, { description: val })}
        />
      </FieldWrapper>
      <FieldWrapper label="HS Code (8-digit)">
        <HSCodeField
          isAiFilled={!!currentLine.hs_code && !!currentLine.confidence}
          value={currentLine.hs_code}
          onValueChange={(val) => updateLine(0, { hs_code: val })}
          confidence={currentLine.confidence}
          description={currentLine.hsDescription}
        />
      </FieldWrapper>
      <FieldWrapper label="Origin Country">
        <CountrySelect 
          value={originCountry || ''} 
          onValueChange={(val) => setStep1({ originCountry: val })} 
        />
      </FieldWrapper>
      <FieldWrapper label="Destination Country">
        <CountrySelect 
          value={destinationCountry || ''} 
          onValueChange={(val) => setStep1({ destinationCountry: val })} 
        />
      </FieldWrapper>
      <FieldWrapper label="Declared Value">
        <TextInput 
          placeholder="2000.00" 
          value={currentLine.value}
          onChange={(val) => updateLine(0, { value: val })}
        />
      </FieldWrapper>
      <FieldWrapper label="Currency">
        <CurrencySelect 
          value={currentLine.currency || 'GBP'} 
          onValueChange={(val) => updateLine(0, { currency: val })} 
        />
      </FieldWrapper>
      <FieldWrapper label="Gross Weight (kg)">
        <TextInput placeholder="e.g., 1.5" />
      </FieldWrapper>
      <FieldWrapper label="Incoterms">
        <IncotermsSelect 
          value={incoterm || ''} 
          onValueChange={(val) => setStep1({ incoterm: val })} 
        />
      </FieldWrapper>
    </div>
  );
};
