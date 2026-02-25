import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const currencies = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];

interface CurrencySelectProps {
  label?: string;
  value?: string; // Currency code
  onValueChange?: (code: string) => void;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({ label, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find(c => c.code === value);

  const handleSelect = (code: string) => {
    onValueChange?.(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className={`w-full bg-[var(--bg)] border rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] transition-all flex items-center justify-between
          ${isOpen ? 'border-[var(--cyan)] shadow-[0_0_0_3px_rgba(0,229,255,0.07)]' : 'border-[var(--border)]'}
          focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {selectedCurrency?.symbol} {selectedCurrency?.code}
        </span>
        <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--s2)] border border-[var(--border2)] rounded-md shadow-lg max-h-60 overflow-y-auto p-1">
          <ul role="listbox">
            {currencies.map(currency => (
              <li
                key={currency.code}
                role="option"
                aria-selected={currency.code === value}
                className={`flex items-center gap-2 px-3.5 py-2 font-mono text-sm cursor-pointer hover:bg-[var(--s3)] rounded-sm
                  ${currency.code === value ? 'bg-[rgba(0,229,255,0.08)] border-l-2 border-[var(--cyan)] pl-3' : 'text-[var(--text)]'}
                `}
                onClick={() => handleSelect(currency.code)}
              >
                {currency.symbol} {currency.code} - {currency.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
