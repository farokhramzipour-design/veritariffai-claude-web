"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorPanel } from '@/components/dashboard/CalculatorPanel';
import { ResultsPanel } from '@/components/dashboard/ResultsPanel';

const CalculatorPage = () => {
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate API call
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-2">New Calculation</h1>
          <p className="font-mono text-sm text-[var(--muted2)]">
            Estimate landed cost, duties, and taxes for international shipments.
          </p>
        </header>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Calculator Panel - Takes 60% width on desktop when results are shown, or 100% if not */}
          <motion.div 
            layout
            className={`w-full ${showResults ? 'xl:w-[60%]' : 'xl:w-full max-w-4xl mx-auto'} transition-all duration-500`}
          >
            <CalculatorPanel onCalculate={handleCalculate} isLoading={isCalculating} />
          </motion.div>

          {/* Results Panel - Takes 40% width on desktop */}
          <AnimatePresence>
            {showResults && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full xl:w-[40%]"
              >
                <ResultsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;