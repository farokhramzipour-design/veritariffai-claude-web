import { HelpCircle, Calculator } from 'lucide-react';
import { NLInput } from './calculator/NLInput';
import { FieldGrid } from './calculator/FieldGrid';
import { AdvancedOptions } from './calculator/AdvancedOptions';
import { CalculateButton } from './calculator/CalculateButton';

export const CalculatorPanel = ({ onCalculate, isLoading }: { onCalculate?: () => void, isLoading?: boolean }) => {
  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--cyan)] rounded-tl-lg"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--muted)] rounded-br-lg"></div>

      {/* Panel Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <Calculator size={20} className="text-[var(--cyan)]" />
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text)]">EXPORT CALCULATOR</h2>
            <p className="font-mono text-xs text-[var(--muted2)]">Calculate landed cost, duties & tariffs</p>
          </div>
        </div>
        <button className="text-[var(--muted2)] hover:text-[var(--text)]">
          <HelpCircle size={20} />
        </button>
      </div>

      <NLInput />
      <FieldGrid />
      <AdvancedOptions />
      <CalculateButton onClick={onCalculate} isLoading={isLoading} />
    </div>
  );
};
