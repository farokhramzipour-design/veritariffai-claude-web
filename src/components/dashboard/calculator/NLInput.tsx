import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useCalculatorStore } from '@/lib/stores/calculatorStore';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="font-display text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--muted)]">{children}</span>
    <div className="flex-grow h-px bg-[var(--border)]"></div>
  </div>
);

export const NLInput = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setStep1, updateLine } = useCalculatorStore();

  const handleAutofill = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('https://api.veritariffai.co/api/v1/autofill', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: input })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch autofill data');
      }

      const data = await response.json();

      // Update store with response data
      setStep1({
        originCountry: data.origin_country || undefined,
        destinationCountry: data.destination_country || undefined,
        incoterm: data.incoterms || undefined,
      });

      updateLine(0, {
        description: data.product_description || '',
        hs_code: data.hs_code || '',
        confidence: data.hs_confidence,
        hsDescription: data.hs_description,
        value: data.declared_value ? String(data.declared_value) : '',
        currency: data.currency || 'GBP'
      });

    } catch (error) {
      console.error('Autofill error:', error);
      // In a real app, we would show a toast notification here
      alert('Failed to autofill fields. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="mb-8">
      <SectionLabel>
        <span role="img" aria-label="brain emoji">🧠</span> AI Autofill
      </SectionLabel>
      <textarea
        className="w-full min-h-[80px] max-h-[160px] bg-[var(--bg)] border border-[var(--border)] rounded-md p-3.5 font-mono text-sm text-[var(--text)] placeholder:text-[var(--muted)] placeholder:italic focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] focus:outline-none transition-all"
        placeholder="e.g. &quot;leather shoes from Birmingham to Paris, £2,000&quot;"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <div className="mt-4 flex items-center gap-4">
        <button 
          onClick={handleAutofill}
          disabled={isLoading || !input.trim()}
          className={`flex items-center gap-2 px-5 py-2.5 bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] rounded text-[var(--cyan)] font-display text-xs font-bold tracking-[0.08em] transition-colors
            ${isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(0,229,255,0.14)] hover:border-[var(--cyan)]'}
          `}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {isLoading ? 'Processing...' : 'Autofill fields with AI'}
        </button>
        <button 
          onClick={handleClear}
          disabled={isLoading || !input}
          className="flex items-center gap-2 text-xs text-[var(--muted2)] hover:text-[var(--text)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={14} />
          Clear
        </button>
      </div>
    </div>
  );
};
