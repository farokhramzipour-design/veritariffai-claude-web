import React, { useState } from 'react';
import { Search, ExternalLink, X } from 'lucide-react';

interface HSCodeFieldProps {
  isAiFilled?: boolean;
  value?: string;
  confidence?: number; // 0-100
  description?: string;
  onValueChange?: (value: string) => void;
  onLookupClick?: () => void;
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 85) return 'var(--green)';
  if (confidence >= 70) return 'var(--gold)';
  return 'var(--red)';
};

export const HSCodeField: React.FC<HSCodeFieldProps> = ({
  isAiFilled,
  value,
  confidence,
  description,
  onValueChange,
  onLookupClick,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for the HS Code Drawer

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`flex-grow bg-[var(--bg)] border rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] transition-all
            ${isAiFilled ? 'border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.03)]' : 'border-[var(--border)]'}
            focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none
          `}
          placeholder="e.g., 6403510000"
        />
        <button
          onClick={() => setIsDrawerOpen(true)} // Open drawer on lookup click
          className="p-2 rounded-md bg-[var(--border2)] text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--s3)] transition-colors"
          aria-label="Lookup HS Code"
        >
          <Search size={18} />
        </button>
      </div>

      {isAiFilled && (
        <div className="absolute top-[-8px] right-14 bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] text-[var(--cyan)] font-mono text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded">
          AI
        </div>
      )}

      {confidence !== undefined && (
        <div className="mt-2">
          <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${confidence}%`, backgroundColor: getConfidenceColor(confidence) }}
            />
          </div>
          <p className="font-mono text-[11px] mt-1" style={{ color: getConfidenceColor(confidence) }}>
            {confidence}% confidence
          </p>
        </div>
      )}

      {description && (
        <p className="font-mono text-[11px] text-[var(--muted2)] mt-1 truncate">
          {description}
        </p>
      )}

      {value && (
        <a
          href={`https://www.trade-tariff.service.gov.uk/headings/${value.substring(0, 4)}`} // Example link, adjust as needed
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-[var(--cyan)] hover:underline flex items-center gap-1 mt-1"
        >
          View on Trade Tariff <ExternalLink size={10} />
        </a>
      )}

      {/* HS Code Drawer Placeholder */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-[var(--s1)] p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">HS Code Lookup</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-[var(--muted2)] hover:text-[var(--text)]">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search HS codes..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md p-2 mb-4"
            />
            <div className="h-48 overflow-y-auto border border-[var(--border)] rounded-md p-2">
              {/* Search results will go here */}
              <p className="text-[var(--muted2)]">Search for HS codes...</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-[var(--cyan)] text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Use this code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
