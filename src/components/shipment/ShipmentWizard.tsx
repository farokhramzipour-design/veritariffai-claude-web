"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShipmentStore } from '@/lib/stores/shipmentStore';
import { StepIndicator } from './StepIndicator';
import { Step1_Classification } from './Step1_Classification';
import { Step2_RulesOfOrigin } from './Step2_RulesOfOrigin';
import { Step3_Sanctions } from './Step3_Sanctions';
import { Step4_GermanCustoms } from './Step4_GermanCustoms';
import { Step5_CBAM } from './Step5_CBAM';
import { Step6_CDS } from './Step6_CDS';
import { Step7_Bundle } from './Step7_Bundle';

export const ShipmentWizard = () => {
  const { currentStep, completedSteps, setStep, resetShipment, shipmentId } = useShipmentStore();

  const goToStep = (step: number) => setStep(step);
  const nextStep = () => setStep(Math.min(currentStep + 1, 7));
  const prevStep = () => setStep(Math.max(currentStep - 1, 1));

  const handleReset = () => {
    if (window.confirm('Start a new shipment? All current progress will be cleared.')) {
      resetShipment();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_Classification onNext={nextStep} />;
      case 2: return <Step2_RulesOfOrigin onNext={nextStep} onBack={prevStep} />;
      case 3: return <Step3_Sanctions onNext={nextStep} onBack={prevStep} />;
      case 4: return <Step4_GermanCustoms onNext={nextStep} onBack={prevStep} />;
      case 5: return <Step5_CBAM onNext={nextStep} onBack={prevStep} />;
      case 6: return <Step6_CDS onNext={nextStep} onBack={prevStep} />;
      case 7: return <Step7_Bundle onBack={prevStep} onReset={handleReset} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-widest">
                Happy Path Workflow
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold">Steel Export Compliance</h1>
            <p className="font-mono text-sm text-[var(--muted2)] mt-1">
              UK → Federal Republic of Germany · HS Chapters 72 & 73 · AEO-in-a-Box
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-[var(--muted2)]">Shipment ID</p>
            <p className="font-mono text-xs text-[var(--cyan)] font-bold">{shipmentId}</p>
            <button
              onClick={handleReset}
              className="font-mono text-[10px] text-[var(--muted2)] hover:text-[#ff5370] mt-1 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--cyan)]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--cyan)]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--muted)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--muted)]" />

          <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6 md:p-8">
            {/* Step Indicator */}
            <StepIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={goToStep}
            />

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer attribution */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[10px] text-[var(--muted2)]">
            Contains public sector information licensed under the{' '}
            <a
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--cyan)] underline"
            >
              Open Government Licence v3.0
            </a>
            . Data sourced from UK Trade Tariff API, HMRC, EU TARIC. © Veritariff Ltd — Confidential.
          </p>
        </div>
      </div>
    </div>
  );
};
