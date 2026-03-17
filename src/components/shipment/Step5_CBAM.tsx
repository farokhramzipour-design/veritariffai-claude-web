"use client";

import React from 'react';
import { ChevronRight, ChevronLeft, Leaf, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useShipmentStore, ProductionRoute } from '@/lib/stores/shipmentStore';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PRODUCTION_ROUTES: { value: ProductionRoute; label: string; desc: string }[] = [
  {
    value: 'BF-BOF',
    label: 'BF-BOF',
    desc: 'Blast Furnace — Basic Oxygen Furnace (primary steel from iron ore)',
  },
  {
    value: 'EAF',
    label: 'EAF',
    desc: 'Electric Arc Furnace (typically recycled scrap)',
  },
  {
    value: 'DRI-EAF',
    label: 'DRI-EAF',
    desc: 'Direct Reduced Iron + Electric Arc Furnace',
  },
];

export const Step5_CBAM = ({ onNext, onBack }: Props) => {
  const { cbam, updateCBAM, markStepComplete, classification } = useShipmentStore();

  const isChapter72 = classification.hsHeading?.startsWith('72');
  const isChapter73 = classification.hsHeading?.startsWith('73');

  // SEE calculation
  const calculateSEE = () => {
    const electricity = parseFloat(cbam.electricityKwh) || 0;
    const directCO2 = parseFloat(cbam.directCO2) || 0;
    const UKGridFactor = 0.233; // tCO2/MWh UK DESNZ 2023

    let indirect = 0;
    if (cbam.productionRoute === 'EAF' || cbam.productionRoute === 'DRI-EAF') {
      indirect = (electricity / 1000) * UKGridFactor;
    } else {
      indirect = (electricity / 1000) * UKGridFactor;
    }

    const total = directCO2 + indirect;

    // UK ETS offset
    let offset = 0;
    if (cbam.ukETSOffsetApplicable) {
      const ukETS = parseFloat(cbam.ukETSCarbonPrice) || 0;
      const euETS = parseFloat(cbam.euETSWeeklyPrice) || 0;
      offset = Math.min(ukETS, euETS);
    }

    const net = Math.max(0, total - offset);
    updateCBAM({
      seeTCO2PerTonne: net.toFixed(4),
      offsetAmount: offset.toFixed(4),
    });
  };

  const handleNext = () => {
    markStepComplete(5);
    onNext();
  };

  const canProceed = cbam.applicable !== null && (cbam.applicable === false || cbam.seeTCO2PerTonne !== '');

  // Determine CBAM phase: transitional ended Dec 2025; definitive from Jan 2026
  const currentPhase = 'definitive'; // as of March 2026

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Leaf size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 5 — EU CBAM Engine
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            Carbon Border Adjustment Mechanism — EU Reg 2023/956 — Embedded Emissions Data
          </p>
        </div>
      </div>

      {/* Phase banner */}
      <div className="flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
        <Info size={16} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-mono text-xs text-[var(--cyan)] font-bold">
            CBAM Definitive Phase — From 1 January 2026
          </p>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            Transitional reporting phase ended December 2025. German importers must now purchase CBAM
            certificates proportional to embedded carbon emissions.
          </p>
        </div>
      </div>

      {/* Step 5.1 — Applicability Gate */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">1</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 5.1 — CBAM Applicability Gate
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--muted2)] mb-3">
          Is commodity code{' '}
          <span className="text-[var(--cyan)] font-bold">
            {classification.hsHeading || '—'}
          </span>{' '}
          in CBAM Annex I (in-scope goods list)?
        </p>

        <div className="flex gap-2 items-start mb-4 bg-[rgba(0,0,0,0.2)] rounded-md p-3">
          <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
          <p className="font-mono text-[10px] text-[var(--muted2)]">
            Principal CBAM steel codes: Chapter 72 headings 7206–7229, select Chapter 73 headings
            7301–7309. Always verify specific subheadings against current CBAM Annex I.
            {isChapter72 && ' HS Chapter 72 detected — likely CBAM applicable.'}
            {isChapter73 && ' HS Chapter 73 detected — verify specific subheading.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {[
            { val: true, label: 'YES — CBAM Applicable', hint: 'Collect emissions data' },
            { val: false, label: 'NO — Not in Annex I', hint: 'Skip to Step 6' },
          ].map(({ val, label, hint }) => (
            <button
              key={String(val)}
              onClick={() => updateCBAM({ applicable: val, phase: val ? currentPhase : null })}
              className={`p-4 rounded-lg border text-left transition-all ${
                cbam.applicable === val
                  ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)]'
                  : 'border-[var(--border)] hover:border-[var(--border2)]'
              }`}
            >
              <p className="font-mono text-xs font-bold text-[var(--text)]">{label}</p>
              <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">{hint}</p>
            </button>
          ))}
        </div>

        {cbam.applicable === false && (
          <div className="mt-4 flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
            <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0" />
            <p className="font-mono text-xs text-[var(--cyan)]">
              CBAM not applicable for this commodity code. Proceed to Step 6 (CDS Declaration).
            </p>
          </div>
        )}
      </div>

      {/* Step 5.2 — Emissions Data Collection */}
      {cbam.applicable === true && (
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">2</div>
            <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Step 5.2 — Specific Embedded Emissions (SEE) Calculation
            </h3>
          </div>

          <p className="font-mono text-xs text-[var(--muted2)] mb-4">
            SEE (tCO₂e/tonne) = Direct_Emissions + Indirect_Emissions
          </p>

          {/* Production Route */}
          <div className="mb-5">
            <label className="block font-mono text-xs text-[var(--muted2)] mb-3 uppercase tracking-wider">
              Production Route
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRODUCTION_ROUTES.map((pr) => (
                <button
                  key={pr.value}
                  onClick={() => updateCBAM({ productionRoute: pr.value })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    cbam.productionRoute === pr.value
                      ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)]'
                      : 'border-[var(--border)] hover:border-[var(--border2)]'
                  }`}
                >
                  <p className="font-mono text-sm font-bold text-[var(--text)]">{pr.label}</p>
                  <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">{pr.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Default values toggle */}
          <div className="flex items-center gap-3 mb-5 p-3 bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.2)] rounded-lg">
            <button
              onClick={() => updateCBAM({ useDefaultValues: !cbam.useDefaultValues })}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                cbam.useDefaultValues ? 'bg-[#ffd166]' : 'bg-[var(--s3)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  cbam.useDefaultValues ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <div>
              <p className="font-mono text-xs text-[var(--text)]">Use EU Commission Default Values</p>
              <p className="font-mono text-[10px] text-[#ffd166] mt-0.5">
                Warning: default values are conservative and will result in higher CBAM costs for the
                importer. Actual emissions data preferred.
              </p>
            </div>
          </div>

          {!cbam.useDefaultValues && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                  Direct CO₂ (tCO₂e/tonne) — furnace operations
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={cbam.directCO2}
                  onChange={(e) => updateCBAM({ directCO2: e.target.value })}
                  className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  placeholder="e.g. 1.8500"
                />
                {cbam.productionRoute === 'EAF' && (
                  <p className="text-[10px] text-[var(--muted2)] mt-1">
                    EAF formula: electrode_kg × 3.636 tCO₂/t_graphite + (gas_GJ × 56.1 tCO₂/TJ)
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                  Electricity Consumption (kWh/tonne)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cbam.electricityKwh}
                  onChange={(e) => updateCBAM({ electricityKwh: e.target.value })}
                  className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  placeholder="e.g. 450"
                />
                <p className="text-[10px] text-[var(--muted2)] mt-1">
                  Indirect emissions: kWh/t × 0.233 tCO₂/MWh (UK DESNZ 2023)
                </p>
              </div>

              {/* UK ETS Offset */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => updateCBAM({ ukETSOffsetApplicable: !cbam.ukETSOffsetApplicable })}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                      cbam.ukETSOffsetApplicable ? 'bg-[var(--cyan)]' : 'bg-[var(--s3)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        cbam.ukETSOffsetApplicable ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="font-mono text-xs text-[var(--text)]">
                    UK ETS carbon cost was paid — apply CBAM offset (Art.9 Reg 2023/956)
                  </span>
                </div>

                {cbam.ukETSOffsetApplicable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                        UK ETS Carbon Price (£/tCO₂)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cbam.ukETSCarbonPrice}
                        onChange={(e) => updateCBAM({ ukETSCarbonPrice: e.target.value })}
                        className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                        placeholder="e.g. 45.00"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                        EU ETS Weekly Price — EUA (€/tCO₂)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cbam.euETSWeeklyPrice}
                        onChange={(e) => updateCBAM({ euETSWeeklyPrice: e.target.value })}
                        className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                        placeholder="e.g. 55.00"
                      />
                      <p className="text-[10px] text-[var(--muted2)] mt-1">
                        Source: ICE Endex EUA price (theice.com)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calculate SEE */}
          <button
            onClick={calculateSEE}
            disabled={cbam.useDefaultValues || (!cbam.directCO2 && !cbam.electricityKwh)}
            className="px-5 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-4"
          >
            Calculate SEE (tCO₂e/tonne)
          </button>

          {/* SEE Result */}
          {(cbam.seeTCO2PerTonne || cbam.useDefaultValues) && (
            <div className="bg-[var(--s3)] rounded-lg p-5 border border-[rgba(100,255,218,0.15)]">
              <p className="font-mono text-xs text-[var(--muted2)] uppercase mb-3">
                Specific Embedded Emissions (SEE) Result
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-mono text-[10px] text-[var(--muted2)]">SEE</p>
                  <p className="font-display text-2xl font-bold text-[var(--cyan)]">
                    {cbam.useDefaultValues ? '~2.15' : cbam.seeTCO2PerTonne}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--muted2)]">tCO₂e / tonne</p>
                </div>
                {cbam.ukETSOffsetApplicable && (
                  <div>
                    <p className="font-mono text-[10px] text-[var(--muted2)]">UK ETS Offset</p>
                    <p className="font-display text-lg font-bold text-[#ffd166]">
                      -{cbam.offsetAmount || '0'}
                    </p>
                    <p className="font-mono text-[10px] text-[var(--muted2)]">tCO₂e offset</p>
                  </div>
                )}
                <div>
                  <p className="font-mono text-[10px] text-[var(--muted2)]">Phase</p>
                  <p className="font-mono text-sm font-bold text-[var(--text)] capitalize">
                    {cbam.phase}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--muted2)]">
                    {cbam.phase === 'definitive' ? 'Certificate purchase required' : 'Quarterly reporting'}
                  </p>
                </div>
              </div>

              {cbam.useDefaultValues && (
                <div className="mt-3 flex gap-2 items-center">
                  <AlertTriangle size={12} className="text-[#ffd166]" />
                  <p className="font-mono text-[10px] text-[#ffd166]">
                    Using EU Commission default values — conservative estimate
                  </p>
                </div>
              )}

              <div className="mt-3 text-[10px] font-mono text-[var(--muted2)]">
                Documents: CBAM Embedded Emissions Certificate · Quarterly Report XML (EU CBAM Registry format) · Carbon Offset Worksheet
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reg ref */}
      <div className="flex gap-2 items-start p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
        <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-[var(--muted2)]">
          Reg ref: EU CBAM Reg 2023/956 Arts.6–9 · EU Implementing Reg 2023/1773 Annex II · DESNZ
          Grid Emission Factors 2023 · cbam.ec.europa.eu · ICE Endex EUA price
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--muted2)] rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:border-[var(--border2)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] text-black rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:bg-[var(--cyan-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continue to CDS Declaration
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
