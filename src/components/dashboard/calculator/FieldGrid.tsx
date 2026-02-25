import React from 'react';
import { HSCodeField } from './HSCodeField';
import { CountrySelect } from './CountrySelect';
import { IncotermsSelect } from './IncotermsSelect';
import { CurrencySelect } from './CurrencySelect';

const FieldWrapper = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block font-mono text-[10px] text-[var(--muted2)] tracking-[0.1em] uppercase mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const TextInput = ({ isAiFilled, placeholder }: { isAiFilled?: boolean, placeholder?: string }) => (
  <div className="relative">
    <input
      type="text"
      className={`w-full bg-[var(--bg)] border rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] transition-all
        ${isAiFilled ? 'border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.03)]' : 'border-[var(--border)]'}
        focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none
      `}
      placeholder={placeholder}
    />
    {isAiFilled && (
      <div className="absolute top-[-8px] right-2 bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] text-[var(--cyan)] font-mono text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded">
        AI
      </div>
    )}
  </div>
);


export const FieldGrid = () => {
  // Dummy state for demonstration
  const [hsCode, setHsCode] = React.useState('');
  const [originCountry, setOriginCountry] = React.useState('GB');
  const [destinationCountry, setDestinationCountry] = React.useState('FR');
  const [currency, setCurrency] = React.useState('GBP');
  const [incoterms, setIncoterms] = React.useState('FOB');

  return (
    <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
      <FieldWrapper label="Product Description">
        <TextInput isAiFilled placeholder="e.g., Leather shoes" />
      </FieldWrapper>
      <FieldWrapper label="HS Code (8-digit)">
        <HSCodeField
          isAiFilled
          value={hsCode}
          onValueChange={setHsCode}
          confidence={94}
          description="Footwear with outer soles of rubber..."
        />
      </FieldWrapper>
      <FieldWrapper label="Origin Country">
        <CountrySelect value={originCountry} onValueChange={setOriginCountry} />
      </FieldWrapper>
      <FieldWrapper label="Destination Country">
        <CountrySelect value={destinationCountry} onValueChange={setDestinationCountry} />
      </FieldWrapper>
      <FieldWrapper label="Declared Value">
        <TextInput placeholder="2000.00" />
      </FieldWrapper>
      <FieldWrapper label="Currency">
        <CurrencySelect value={currency} onValueChange={setCurrency} />
      </FieldWrapper>
      <FieldWrapper label="Gross Weight (kg)">
        <TextInput placeholder="e.g., 1.5" />
      </FieldWrapper>
      <FieldWrapper label="Incoterms">
        <IncotermsSelect value={incoterms} onValueChange={setIncoterms} />
      </FieldWrapper>
    </div>
  );
};
