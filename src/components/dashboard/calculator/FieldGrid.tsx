import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { HSCodeField } from './HSCodeField';
import { CountrySelect } from './CountrySelect';
import { IncotermsSelect } from './IncotermsSelect';
import { CurrencySelect } from './CurrencySelect';
import { useCalculatorStore } from '@/lib/stores/calculatorStore';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block font-mono text-[10px] text-[var(--muted2)] tracking-[0.1em] uppercase mb-1.5">
    {children}
  </label>
);

const TextInput = ({
  placeholder,
  value,
  onChange,
  isAiFilled,
  type = 'text',
}: {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  isAiFilled?: boolean;
  type?: string;
}) => (
  <div className="relative">
    <input
      type={type}
      className={`w-full bg-[var(--bg)] border rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] transition-all
        ${isAiFilled ? 'border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.03)]' : 'border-[var(--border)]'}
        focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none
      `}
      placeholder={placeholder}
      value={value ?? ''}
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
    updateLine,
    addLine,
    removeLine,
  } = useCalculatorStore();

  return (
    <div className="space-y-6 mb-8">
      {/* Shipment fields */}
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <Label>Origin Country *</Label>
          <CountrySelect
            value={originCountry ?? ''}
            onValueChange={(val) => setStep1({ originCountry: val })}
          />
        </div>
        <div>
          <Label>Destination Country *</Label>
          <CountrySelect
            value={destinationCountry ?? ''}
            onValueChange={(val) => setStep1({ destinationCountry: val })}
          />
        </div>
        <div>
          <Label>Incoterms</Label>
          <IncotermsSelect
            value={incoterm ?? ''}
            onValueChange={(val) => setStep1({ incoterm: val })}
          />
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--muted)]">
            Line Items
          </span>
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 text-xs text-[var(--cyan)] hover:opacity-80 transition-opacity font-bold"
          >
            <Plus size={14} /> Add Line
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, i) => (
            <div
              key={i}
              className="relative p-4 bg-[var(--bg)] border border-[var(--border)] rounded-lg"
            >
              {lines.length > 1 && (
                <button
                  onClick={() => removeLine(i)}
                  className="absolute top-3 right-3 text-[var(--muted2)] hover:text-red-400 transition-colors"
                  title="Remove line"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <Label>Product Description</Label>
                  <TextInput
                    isAiFilled={!!line.description}
                    placeholder="e.g., Hot-rolled steel coil"
                    value={line.description}
                    onChange={(val) => updateLine(i, { description: val })}
                  />
                </div>
                <div>
                  <Label>HS Code *</Label>
                  <HSCodeField
                    isAiFilled={!!line.hs_code && !!line.confidence}
                    value={line.hs_code}
                    onValueChange={(val) => updateLine(i, { hs_code: val })}
                    confidence={line.confidence}
                    description={line.hsDescription}
                  />
                </div>
                <div>
                  <Label>CIF Value *</Label>
                  <TextInput
                    type="number"
                    placeholder="e.g., 5000"
                    value={line.value}
                    onChange={(val) => updateLine(i, { value: val })}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <CurrencySelect
                    value={line.currency ?? 'GBP'}
                    onValueChange={(val) => updateLine(i, { currency: val })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
