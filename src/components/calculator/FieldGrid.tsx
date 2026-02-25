import React from 'react';
import HSCodeField from './HSCodeField';
import CountrySelect from './CountrySelect';
import IncotermsSelect from './IncotermsSelect';

const FieldGrid = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div>
        <label className="font-mono text-xs text-[var(--muted2)] tracking-widest uppercase mb-2 block">
          Product Description
        </label>
        <input
          type="text"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md p-3 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)]"
        />
      </div>
      <HSCodeField />
      <CountrySelect label="Origin Country" />
      <CountrySelect label="Destination Country" />
      <div>
        <label className="font-mono text-xs text-[var(--muted2)] tracking-widest uppercase mb-2 block">
          Declared Value
        </label>
        <input
          type="text"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md p-3 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)]"
        />
      </div>
      <div>
        <label className="font-mono text-xs text-[var(--muted2)] tracking-widest uppercase mb-2 block">
          Currency
        </label>
        <input
          type="text"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md p-3 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)]"
        />
      </div>
      <div>
        <label className="font-mono text-xs text-[var(--muted2)] tracking-widest uppercase mb-2 block">
          Gross Weight
        </label>
        <input
          type="text"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md p-3 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)]"
        />
      </div>
      <IncotermsSelect />
    </div>
  );
};

export default FieldGrid;
