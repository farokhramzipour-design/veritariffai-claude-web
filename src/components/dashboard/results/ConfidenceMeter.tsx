import React, { useState, useEffect } from 'react';

type ConfidenceFactor = {
  factor: string;
  contribution: number;
  source: 'LIVE' | 'STATIC' | 'AI' | 'CHECKED' | 'LIVE 1h cache';
};

export const ConfidenceMeter = ({ confidence, factors }: { confidence: number, factors: ConfidenceFactor[] }) => {
  const [displayConfidence, setDisplayConfidence] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = confidence;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      setDisplayConfidence(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [confidence]);

  const getColor = (val: number) => {
    if (val >= 90) return 'var(--green)';
    if (val >= 70) return 'var(--gold)';
    return 'var(--red)';
  };

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-md p-6 mb-8">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="font-display text-sm font-bold tracking-[0.08em] uppercase text-[var(--muted2)]">Estimate Confidence</h3>
        <span 
          className="font-display text-5xl font-extrabold"
          style={{ color: getColor(displayConfidence) }}
        >
          {displayConfidence}%
        </span>
      </div>

      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-6">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${displayConfidence}%`,
            background: 'linear-gradient(90deg, var(--cyan), var(--purple))'
          }}
        ></div>
      </div>

      <div className="space-y-2">
        {factors.map((item, index) => (
          <div key={index} className="grid grid-cols-[160px_1fr_48px_80px] gap-3 items-center py-2 border-b border-[rgba(28,45,71,0.5)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors">
            <span className="font-mono text-[11px] text-[var(--text)]">{item.factor}</span>
            <div className="h-1 bg-[var(--bg)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${item.contribution * 3}%`, // Scale up for visibility
                  backgroundColor: index < 3 ? 'var(--cyan)' : 'var(--muted2)'
                }}
              ></div>
            </div>
            <span className="font-mono text-[11px] font-bold text-[var(--cyan)] text-right">+{item.contribution}%</span>
            <div className="flex justify-end">
              <span 
                className={`font-mono text-[8px] tracking-[0.12em] px-1.5 py-0.5 rounded uppercase
                  ${item.source.includes('LIVE') ? 'text-[var(--green)] bg-[rgba(0,217,126,0.1)] border border-[rgba(0,217,126,0.2)]' : ''}
                  ${item.source === 'STATIC' ? 'text-[var(--gold)] bg-[rgba(255,209,102,0.1)] border border-[rgba(255,209,102,0.2)]' : ''}
                  ${item.source === 'AI' ? 'text-[var(--purple)] bg-[rgba(179,136,255,0.1)] border border-[rgba(179,136,255,0.2)]' : ''}
                  ${item.source === 'CHECKED' ? 'text-[var(--cyan)] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)]' : ''}
                `}
              >
                {item.source}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};