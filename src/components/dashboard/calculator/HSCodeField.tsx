"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, X, Loader2, Sparkles } from 'lucide-react';
import { tariffApi } from '@/lib/api/tariff';
import { hsLookupApi } from '@/lib/api/hsLookup';

interface HSCodeFieldProps {
  isAiFilled?: boolean;
  value?: string;
  confidence?: number;
  description?: string;
  onValueChange?: (value: string) => void;
}

interface HSResult {
  code?: string;
  hs_code?: string;
  description?: string;
  confidence?: number;
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
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'ai'>('ai');
  const [results, setResults] = useState<HSResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setResults([]);

    try {
      if (searchMode === 'ai') {
        const res = await hsLookupApi.lookup({ product_description: searchQuery }) as unknown as Record<string, unknown>;
        const main: HSResult = { hs_code: res.hs_code as string, description: res.description as string, confidence: res.confidence as number };
        const alts = ((res.alternatives ?? []) as HSResult[]);
        setResults([main, ...alts].filter(r => r.hs_code));
      } else {
        const res = await tariffApi.search(searchQuery, 'UK', 10) as unknown as HSResult[];
        setResults(Array.isArray(res) ? res : []);
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (result: HSResult) => {
    const code = result.hs_code ?? result.code ?? '';
    onValueChange?.(code);
    setIsDrawerOpen(false);
    setResults([]);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`flex-grow bg-[var(--bg)] border rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] transition-all
            ${isAiFilled ? 'border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.03)]' : 'border-[var(--border)]'}
            focus:border-[var(--cyan)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] focus:outline-none
          `}
          placeholder="e.g., 7208510000"
        />
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-md bg-[var(--border2)] text-[var(--muted2)] hover:text-[var(--cyan)] hover:bg-[rgba(0,229,255,0.08)] transition-colors"
          title="Look up HS code"
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
        <p className="font-mono text-[11px] text-[var(--muted2)] mt-1 truncate">{description}</p>
      )}

      {value && (
        <a
          href={`https://www.trade-tariff.service.gov.uk/headings/${value.substring(0, 4)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-[var(--cyan)] hover:underline flex items-center gap-1 mt-1"
        >
          View on UK Trade Tariff <ExternalLink size={10} />
        </a>
      )}

      {/* HS Code Lookup Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsDrawerOpen(false)}>
          <div
            className="bg-[var(--s1)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h3 className="font-bold text-base">HS Code Lookup</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-[var(--muted2)] hover:text-[var(--text)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchMode('ai')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    searchMode === 'ai'
                      ? 'bg-[rgba(0,229,255,0.12)] text-[var(--cyan)] border border-[rgba(0,229,255,0.3)]'
                      : 'text-[var(--muted2)] border border-[var(--border)] hover:text-[var(--text)]'
                  }`}
                >
                  <Sparkles size={12} /> AI Lookup
                </button>
                <button
                  onClick={() => setSearchMode('keyword')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    searchMode === 'keyword'
                      ? 'bg-[rgba(0,229,255,0.12)] text-[var(--cyan)] border border-[rgba(0,229,255,0.3)]'
                      : 'text-[var(--muted2)] border border-[var(--border)] hover:text-[var(--text)]'
                  }`}
                >
                  <Search size={12} /> Keyword Search
                </button>
              </div>

              {/* Search input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={searchMode === 'ai' ? 'Describe your product…' : 'Search HS codes or keywords…'}
                  className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 rounded-md bg-[var(--cyan)] text-black font-bold text-sm disabled:opacity-50"
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                </button>
              </div>

              {searchError && (
                <p className="text-xs text-red-400 font-mono">{searchError}</p>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(r)}
                      className="w-full text-left p-3 rounded-lg border border-[var(--border)] hover:border-[rgba(0,229,255,0.4)] hover:bg-[rgba(0,229,255,0.04)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-[var(--cyan)]">
                          {r.hs_code ?? r.code}
                        </span>
                        {r.confidence !== undefined && (
                          <span className="text-[10px] font-mono" style={{ color: getConfidenceColor(r.confidence) }}>
                            {r.confidence}% match
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-[var(--muted2)] mt-0.5 line-clamp-2">{r.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.length === 0 && searchQuery && (
                <p className="text-xs text-[var(--muted2)] text-center py-4">
                  No results yet — click Search or press Enter
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
