import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const incotermsOptions = [
  { code: 'EXW', name: 'Ex Works', description: 'Buyer takes all risk from seller\'s premises' },
  { code: 'FOB', name: 'Free on Board', description: 'Seller responsible until goods on vessel' },
  { code: 'CIF', name: 'Cost Insurance Freight', description: 'Seller covers cost, insurance, freight' },
  { code: 'DDP', name: 'Delivered Duty Paid', description: 'Seller responsible for all costs to destination' },
];

interface IncotermsSelectProps {
  label?: string;
  value?: string; // Incoterm code
  onValueChange?: (code: string) => void;
}

export const IncotermsSelect: React.FC<IncotermsSelectProps> = ({ label, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedIncoterm = incotermsOptions.find(term => term.code === value);

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
        <span className="flex flex-col items-start">
          <span className="text-[var(--text)]">{selectedIncoterm?.code || 'Select Incoterm'}</span>
          {selectedIncoterm && (
            <span className="text-[var(--muted2)] text-xs">{selectedIncoterm.description}</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--s2)] border border-[var(--border2)] rounded-md shadow-lg max-h-60 overflow-y-auto p-1">
          <ul role="listbox">
            {incotermsOptions.map(term => (
              <li
                key={term.code}
                role="option"
                aria-selected={term.code === value}
                className={`flex flex-col items-start px-3.5 py-2 font-mono text-sm cursor-pointer hover:bg-[var(--s3)] rounded-sm
                  ${term.code === value ? 'bg-[rgba(0,229,255,0.08)] border-l-2 border-[var(--cyan)] pl-3' : 'text-[var(--text)]'}
                `}
                onClick={() => handleSelect(term.code)}
              >
                <span className="text-[var(--cyan)] font-bold">{term.code} - {term.name}</span>
                <span className="text-[var(--muted2)] text-xs">{term.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
