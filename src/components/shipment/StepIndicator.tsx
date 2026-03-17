"use client";

import React from 'react';
import { Check, Lock } from 'lucide-react';

interface Step {
  number: number;
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Classification', sublabel: 'HS Code' },
  { number: 2, label: 'Rules of Origin', sublabel: 'TCA Preference' },
  { number: 3, label: 'Sanctions', sublabel: 'MTC Verification' },
  { number: 4, label: 'German Customs', sublabel: 'ATLAS / SIGL' },
  { number: 5, label: 'CBAM', sublabel: 'Emissions Data' },
  { number: 6, label: 'CDS Declaration', sublabel: 'UK Export DE' },
  { number: 7, label: "Barrister's Bundle", sublabel: 'Clearance Gate' },
];

interface Props {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export const StepIndicator = ({ currentStep, completedSteps, onStepClick }: Props) => {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2 mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.number);
        const isActive = step.number === currentStep;
        const isAccessible = step.number <= currentStep || isCompleted;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.number} className="flex items-start flex-shrink-0">
            {/* Step node */}
            <button
              onClick={() => isAccessible && onStepClick(step.number)}
              disabled={!isAccessible}
              className="flex flex-col items-center group"
            >
              {/* Circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200
                  ${isCompleted
                    ? 'bg-[var(--cyan)] border-[var(--cyan)] text-black'
                    : isActive
                    ? 'bg-transparent border-[var(--cyan)] text-[var(--cyan)]'
                    : isAccessible
                    ? 'bg-transparent border-[var(--border2)] text-[var(--muted2)] group-hover:border-[var(--cyan)] group-hover:text-[var(--cyan)]'
                    : 'bg-transparent border-[var(--border)] text-[var(--border)] cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={14} />
                ) : !isAccessible ? (
                  <Lock size={12} />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center" style={{ minWidth: '70px' }}>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
                    isActive
                      ? 'text-[var(--cyan)]'
                      : isCompleted
                      ? 'text-[var(--text)]'
                      : 'text-[var(--muted2)]'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[9px] text-[var(--muted2)] mt-0.5">{step.sublabel}</p>
              </div>
            </button>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`flex-shrink-0 h-0.5 mt-4 mx-1 transition-all duration-300 ${
                  completedSteps.includes(step.number)
                    ? 'bg-[var(--cyan)]'
                    : 'bg-[var(--border)]'
                }`}
                style={{ width: '40px' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
