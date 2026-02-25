import { Sparkles, X } from 'lucide-react';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="font-display text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--muted)]">{children}</span>
    <div className="flex-grow h-px bg-[var(--border)]"></div>
  </div>
);

export const NLInput = () => {
  return (
    <div className="mb-8">
      <SectionLabel>
        <span role="img" aria-label="brain emoji">🧠</span> AI Autofill
      </SectionLabel>
      <textarea
        className="w-full min-h-[80px] max-h-[160px] bg-[var(--bg)] border border-[var(--border)] rounded-md p-3.5 font-mono text-sm text-[var(--text)] placeholder:text-[var(--muted)] placeholder:italic focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] focus:outline-none transition-all"
        placeholder="e.g. &quot;leather shoes from Birmingham to Paris, £2,000&quot;"
      />
      <div className="mt-4 flex items-center gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] rounded text-[var(--cyan)] font-display text-xs font-bold tracking-[0.08em] hover:bg-[rgba(0,229,255,0.14)] hover:border-[var(--cyan)] transition-colors">
          <Sparkles size={14} />
          Autofill fields with AI
        </button>
        <button className="flex items-center gap-2 text-xs text-[var(--muted2)] hover:text-[var(--text)]">
          <X size={14} />
          Clear
        </button>
      </div>
    </div>
  );
};
