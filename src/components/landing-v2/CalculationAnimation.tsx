"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, FileInput, Globe, Cpu, BarChart, ShieldCheck } from 'lucide-react';

const steps = [
  {
    name: "Shipment Data",
    icon: Globe,
    lines: ["Origin: China (CN)", "Destination: UK (GB)", "Incoterm: FOB"],
  },
  {
    name: "Line Item",
    icon: FileInput,
    lines: ["HS Code: 8471.30.00", "Value: $10,000 USD"],
  },
  {
    name: "Running Engines",
    icon: Cpu,
    lines: ["Customs Valuation", "Tariff Measures", "Rules of Origin", "VAT & Excise", "Compliance Flags"],
  },
  {
    name: "Result",
    icon: BarChart,
    lines: ["Landed Cost: £14,984.52"],
  },
];

const lineVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4 },
  }),
};

export const CalculationAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedEngines, setCheckedEngines] = useState<boolean[]>([]);

  useEffect(() => {
    const cycle = () => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % steps.length;
        if (nextStep === 2) { // "Running Engines" step
          setCheckedEngines(new Array(steps[2].lines.length).fill(false));
          let engineIndex = 0;
          const engineInterval = setInterval(() => {
            setCheckedEngines(prev => {
              const newChecked = [...prev];
              newChecked[engineIndex] = true;
              return newChecked;
            });
            engineIndex++;
            if (engineIndex >= steps[2].lines.length) {
              clearInterval(engineInterval);
            }
          }, 300);
        }
        return nextStep;
      });
    };

    const intervalId = setInterval(cycle, 4000); // Cycle every 4 seconds
    return () => clearInterval(intervalId);
  }, []);

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="relative h-96 w-full max-w-md mx-auto bg-navy-light/50 rounded-lg border border-glass-border p-6 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-brand-blue" />
        <p className="text-sm font-semibold text-white">{step.name}</p>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
        </div>
      </div>

      <div className="mt-6 font-mono text-sm text-slate-300 h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {currentStep === 2 ? ( // Special rendering for "Running Engines"
              <div className="space-y-3">
                {step.lines.map((line, i) => (
                  <div key={line} className="flex items-center gap-3">
                    {checkedEngines[i] ? (
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-slate-500 rounded-sm" />
                    )}
                    <span className={checkedEngines[i] ? 'text-green-400' : 'text-slate-400'}>{line}</span>
                  </div>
                ))}
              </div>
            ) : ( // Default rendering for other steps
              <div className="space-y-3">
                {step.lines.map((line, i) => (
                  <motion.div
                    key={line}
                    custom={i}
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{line}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {currentStep === 3 && ( // Special styling for the final result
                <motion.p 
                    className="text-3xl font-bold text-white mt-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                >
                    £14,984.52
                </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-4 left-6 text-xs text-slate-500">
        STATUS: <span className="text-green-400">LIVE</span>
      </div>
    </div>
  );
};
