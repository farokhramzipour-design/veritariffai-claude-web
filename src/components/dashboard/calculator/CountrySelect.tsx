import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Dummy country data for now
const countries = [
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

interface CountrySelectProps {
  label?: string;
  value?: string; // ISO 2-letter code
  onValueChange?: (code: string) => void;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ label, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.code === value);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (countryCode: string) => {
    onValueChange?.(countryCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
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
          {selectedCountry?.flag} {selectedCountry?.name || 'Select Country'}
        </span>
        <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--s2)] border border-[var(--border2)] rounded-md shadow-lg max-h-60 overflow-y-auto p-1">
          <input
            type="text"
            className="sticky top-0 w-full bg-[var(--bg)] border-b border-[var(--border)] px-3.5 py-2 font-mono text-sm text-[var(--text)] focus:outline-none"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <ul role="listbox" className="mt-1">
            {filteredCountries.map(country => (
              <li
                key={country.code}
                role="option"
                aria-selected={country.code === value}
                className={`flex items-center gap-2 px-3.5 py-2 font-mono text-sm cursor-pointer hover:bg-[var(--s3)] rounded-sm
                  ${country.code === value ? 'bg-[rgba(0,229,255,0.08)] border-l-2 border-[var(--cyan)] pl-3' : 'text-[var(--text)]'}
                `}
                onClick={() => handleSelect(country.code)}
              >
                {country.flag} {country.name}
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3.5 py-2 text-[var(--muted)] font-mono text-sm">No countries found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
