import React from 'react';
import { Printer, Save, Share2, Plus } from 'lucide-react';

export const ResultsActions = () => {
  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border)]">
      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text)] font-display text-xs font-bold hover:bg-[var(--s2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all">
        <Printer size={14} />
        Print / PDF
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text)] font-display text-xs font-bold hover:bg-[var(--s2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all">
        <Save size={14} />
        Save Calculation
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text)] font-display text-xs font-bold hover:bg-[var(--s2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all">
        <Share2 size={14} />
        Share
      </button>
      <button className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--cyan)] border border-[var(--cyan)] rounded text-black font-display text-xs font-bold hover:bg-[#33efff] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all">
        <Plus size={14} />
        New Calculation
      </button>
    </div>
  );
};