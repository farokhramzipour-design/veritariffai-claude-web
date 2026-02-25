import React from 'react';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';

type Warning = {
  type: 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
};

export const WarningCards = ({ warnings }: { warnings: Warning[] }) => {
  return (
    <div className="space-y-4 mb-8">
      {warnings.map((warning, index) => (
        <div 
          key={index} 
          className={`p-4 rounded-md border flex gap-4 items-start
            ${warning.type === 'warning' ? 'bg-[rgba(255,83,112,0.05)] border-[rgba(255,83,112,0.2)]' : 'bg-[rgba(0,229,255,0.05)] border-[rgba(0,229,255,0.2)]'}
          `}
        >
          <div className={`mt-0.5 ${warning.type === 'warning' ? 'text-[var(--red)]' : 'text-[var(--cyan)]'}`}>
            {warning.type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
          </div>
          <div className="flex-1">
            <h4 className={`font-display text-sm font-bold mb-1 ${warning.type === 'warning' ? 'text-[var(--red)]' : 'text-[var(--cyan)]'}`}>
              {warning.title}
            </h4>
            <p className="font-mono text-xs text-[var(--muted2)] leading-relaxed mb-2">
              {warning.message}
            </p>
            {warning.action && (
              <button className={`flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase hover:underline ${warning.type === 'warning' ? 'text-[var(--red)]' : 'text-[var(--cyan)]'}`}>
                {warning.action} <ArrowRight size={10} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};