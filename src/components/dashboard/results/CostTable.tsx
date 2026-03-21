import React from 'react';
import { ChevronDown } from 'lucide-react';

type CostItem = {
  component: string;
  rate: string;
  amount_gbp: number;
  amount_eur: number;
  amount_usd: number;
};

type TotalCost = {
  gbp: number;
  eur: number;
  usd: number;
};

export const CostTable = ({ breakdown, total }: { breakdown: CostItem[], total: TotalCost }) => {
  const fmt = (val: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(val);

  const showEur = breakdown.some(i => i.amount_eur > 0) || total.eur > 0;

  return (
    <div className="mb-8">
      <h3 className="font-display text-sm font-bold tracking-[0.08em] uppercase text-[var(--muted2)] mb-4">Cost Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-3 font-mono text-[10px] font-normal text-[var(--muted2)] tracking-[0.1em] uppercase">Component</th>
              <th className="py-3 font-mono text-[10px] font-normal text-[var(--muted2)] tracking-[0.1em] uppercase text-right">Rate</th>
              <th className="py-3 font-mono text-[10px] font-normal text-[var(--muted2)] tracking-[0.1em] uppercase text-right">GBP</th>
              {showEur && <th className="py-3 font-mono text-[10px] font-normal text-[var(--muted2)] tracking-[0.1em] uppercase text-right">EUR</th>}
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, index) => (
              <tr key={index} className="border-b border-[rgba(28,45,71,0.3)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="py-3 font-mono text-xs text-[var(--text)]">{item.component}</td>
                <td className="py-3 font-mono text-xs text-[var(--muted2)] text-right">{item.rate}</td>
                <td className="py-3 font-mono text-xs text-[var(--text)] text-right">{fmt(item.amount_gbp, 'GBP')}</td>
                {showEur && <td className="py-3 font-mono text-xs text-[var(--muted2)] text-right">{fmt(item.amount_eur, 'EUR')}</td>}
              </tr>
            ))}
            <tr className="bg-[rgba(0,229,255,0.03)] border-t border-[var(--cyan)]">
              <td className="py-4 font-display text-sm font-bold text-[var(--text)] pl-2">TOTAL LANDED COST</td>
              <td className="py-4" />
              <td className="py-4 font-mono text-sm font-bold text-[var(--cyan)] text-right">{fmt(total.gbp, 'GBP')}</td>
              {showEur && <td className="py-4 font-mono text-sm text-[var(--muted2)] text-right pr-2">{fmt(total.eur, 'EUR')}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};