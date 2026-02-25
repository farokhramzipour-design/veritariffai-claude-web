import React from 'react';
import NLInput from './NLInput';
import FieldGrid from './FieldGrid';
import AdvancedOptions from './AdvancedOptions';
import CalculateButton from './CalculateButton';

const CalculatorPanel = () => {
  return (
    <div
      className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 relative"
      style={{
        '--bg': '#060910',
        '--s1': '#0c1220',
        '--s2': '#111b2e',
        '--s3': '#162038',
        '--border': '#1c2d47',
        '--border2': '#243550',
        '--cyan': '#00e5ff',
        '--orange': '#ff6b35',
        '--green': '#00d97e',
        '--gold': '#ffd166',
        '--purple': '#b388ff',
        '--red': '#ff5370',
        '--text': '#dce9ff',
        '--muted': '#4a6a8a',
        '--muted2': '#6a8aaa',
      } as React.CSSProperties}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--cyan)] rounded-tl-lg"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--muted)] rounded-br-lg"></div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-base font-bold text-[var(--text)]">
            EXPORT CALCULATOR
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)]">
            Calculate landed cost, duties & tariffs
          </p>
        </div>
        <button className="text-[var(--muted2)] hover:text-[var(--cyan)]">
          ?
        </button>
      </div>

      <NLInput />
      <FieldGrid />
      <AdvancedOptions />
      <CalculateButton />
    </div>
  );
};

export default CalculatorPanel;
