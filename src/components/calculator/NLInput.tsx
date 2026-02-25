import React from 'react';

const NLInput = () => {
  return (
    <div className="mb-8">
      <label className="font-display text-xs font-bold tracking-widest uppercase text-[var(--muted)] flex items-center gap-2 mb-4">
        🧠 AI Autofill
        <span className="flex-1 h-px bg-[var(--border)]"></span>
      </label>
      <textarea
        className="w-full min-h-[80px] max-h-[160px] bg-[var(--bg)] border border-[var(--border)] rounded-md p-4 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
        placeholder="e.g. 'leather shoes from Birmingham to Paris, £2,000'"
      ></textarea>
      <div className="flex items-center justify-between mt-4">
        <button className="bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] text-[var(--cyan)] font-display text-xs font-bold tracking-widest py-2 px-4 rounded-md hover:bg-[rgba(0,229,255,0.14)] hover:border-[var(--cyan)]">
          ✦ Autofill fields with AI
        </button>
        <button className="text-[var(--muted2)] hover:text-[var(--text)]">
          ✕ Clear
        </button>
      </div>
    </div>
  );
};

export default NLInput;
