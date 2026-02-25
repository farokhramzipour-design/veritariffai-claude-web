import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    <div className={`w-4 h-4 rounded-sm border transition-all flex items-center justify-center
      ${checked ? 'bg-[var(--cyan)] border-[var(--cyan)]' : 'bg-[var(--bg)] border-[var(--border)]'}
    `}>
      {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
    </div>
    <span className="font-mono text-sm text-[var(--text)]">{label}</span>
  </label>
);

export const AdvancedOptions = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [antiDumping, setAntiDumping] = useState(false);
  const [exciseDuty, setExciseDuty] = useState(false);
  const [ukOrigin, setUkOrigin] = useState(false);

  return (
    <div className="mb-8">
      <button
        className="w-full flex items-center justify-between py-3 px-4 bg-[var(--s1)] border border-[var(--border)] rounded-md text-[var(--text)] hover:bg-[var(--s2)] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <span className="font-display text-sm font-bold">ADVANCED OPTIONS</span>
        </div>
      </button>

      {isExpanded && (
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mt-4 p-4 bg-[var(--s1)] border border-[var(--border)] rounded-md">
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block font-mono text-[10px] text-[var(--muted2)] tracking-[0.1em] uppercase mb-1.5">
                Insurance Value (optional)
              </label>
              <input
                type="number"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none"
                placeholder="e.g., 100.00"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[var(--muted2)] tracking-[0.1em] uppercase mb-1.5">
                Freight Cost (optional)
              </label>
              <input
                type="number"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none"
                placeholder="e.g., 50.00"
              />
            </div>
          </div>
          <div className="col-span-2 space-y-3 mt-4">
            <Checkbox
              label="Include anti-dumping check"
              checked={antiDumping}
              onChange={() => setAntiDumping(!antiDumping)}
            />
            <Checkbox
              label="Include excise duty (alcohol/tobacco/energy)"
              checked={exciseDuty}
              onChange={() => setExciseDuty(!exciseDuty)}
            />
            <Checkbox
              label="Goods are of UK origin (for TCA RoO preference)"
              checked={ukOrigin}
              onChange={() => setUkOrigin(!ukOrigin)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
