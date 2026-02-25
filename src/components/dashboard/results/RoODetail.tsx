import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

type RoOData = {
  qualifies: 'yes' | 'no' | 'uncertain';
  confidence: number;
  tca_rule: string;
  reasoning: string;
  recommended_actions: string[];
};

export const RoODetail = ({ roo }: { roo: RoOData }) => {
  const getStatusColor = () => {
    if (roo.qualifies === 'yes') return 'var(--green)';
    if (roo.qualifies === 'no') return 'var(--red)';
    return 'var(--gold)';
  };

  const getStatusIcon = () => {
    if (roo.qualifies === 'yes') return <CheckCircle2 size={20} className="text-[var(--green)]" />;
    if (roo.qualifies === 'no') return <XCircle size={20} className="text-[var(--red)]" />;
    return <HelpCircle size={20} className="text-[var(--gold)]" />;
  };

  return (
    <div className="mb-8">
      <h3 className="font-display text-sm font-bold tracking-[0.08em] uppercase text-[var(--muted2)] mb-4">Rules of Origin Analysis</h3>
      
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-md p-5">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border)]">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[var(--text)]">
                {roo.qualifies === 'yes' ? 'Qualifies for Preferential Tariff' : 
                 roo.qualifies === 'no' ? 'Does Not Qualify' : 'Origin Uncertain'}
              </span>
              <span 
                className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                style={{ 
                  color: getStatusColor(), 
                  borderColor: getStatusColor(),
                  backgroundColor: `${getStatusColor()}1a` // 10% opacity
                }}
              >
                {roo.confidence}% CONFIDENCE
              </span>
            </div>
            <p className="font-mono text-xs text-[var(--muted2)] mt-1">
              Based on UK-EU TCA · Heading {roo.tca_rule.substring(0, 20)}...
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Applicable Rule</h4>
            <p className="font-mono text-xs text-[var(--text)] bg-[var(--s2)] p-3 rounded border border-[var(--border)]">
              {roo.tca_rule}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Reasoning</h4>
            <p className="font-mono text-xs text-[var(--muted2)] leading-relaxed">
              {roo.reasoning}
            </p>
          </div>

          {roo.recommended_actions.length > 0 && (
            <div>
              <h4 className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Recommended Actions</h4>
              <ul className="space-y-2">
                {roo.recommended_actions.map((action, i) => (
                  <li key={i} className="flex gap-2 font-mono text-xs text-[var(--text)]">
                    <span className="text-[var(--cyan)]">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};