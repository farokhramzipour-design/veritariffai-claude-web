import { Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const CalculateButton = ({ onClick, isLoading }: { onClick?: () => void, isLoading?: boolean }) => {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isLoading]);

  const steps = [
    { text: 'HS code validated', status: 'done' },
    { text: 'Duty rate fetched (UK Trade Tariff)', status: 'done' },
    { text: 'FX rate fetched · GBP → EUR: 1.170', status: 'done' },
    { text: 'Checking Rules of Origin...', status: 'loading' },
    { text: 'Building cost estimate...', status: 'pending' },
  ];

  return (
    <div className="w-full">
      <button 
        onClick={!isLoading ? onClick : undefined}
        disabled={isLoading}
        className={`w-full px-8 py-3.5 border rounded-md font-display text-sm font-bold tracking-[0.08em] transition-all duration-200 ease-in-out
          ${isLoading 
            ? 'bg-[rgba(0,229,255,0.06)] border-[rgba(0,229,255,0.1)] text-[var(--muted2)] cursor-wait' 
            : 'bg-gradient-to-r from-[rgba(0,229,255,0.12)] to-[rgba(0,229,255,0.06)] border-[rgba(0,229,255,0.3)] text-[var(--cyan)] hover:bg-[rgba(0,229,255,0.18)] hover:border-[var(--cyan)] hover:shadow-[0_0_24px_rgba(0,229,255,0.15)] hover:-translate-y-px cursor-pointer'
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>Calculate Export Costs →</span>
            </>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isLoading && (
          <div className="mt-4 space-y-2 pl-2">
            {steps.map((step, index) => (
              index <= loadingStep && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 font-mono text-[11px]"
                >
                  {index < loadingStep ? (
                    <CheckCircle2 size={12} className="text-[var(--green)]" />
                  ) : index === loadingStep ? (
                    <Loader2 size={12} className="text-[var(--cyan)] animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-[var(--muted)]" />
                  )}
                  <span className={index < loadingStep ? 'text-[var(--text)]' : index === loadingStep ? 'text-[var(--cyan)]' : 'text-[var(--muted)]'}>
                    {step.text}
                  </span>
                </motion.div>
              )
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
