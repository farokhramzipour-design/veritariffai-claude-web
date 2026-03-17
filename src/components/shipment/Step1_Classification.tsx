"use client";

import React, { useState } from 'react';
import { ChevronRight, Info, CheckCircle, AlertTriangle, Beaker } from 'lucide-react';
import { useShipmentStore, MaterialType, PhysicalForm } from '@/lib/stores/shipmentStore';

const MATERIAL_TYPES: { value: MaterialType; label: string; heading: string }[] = [
  { value: 'waste_or_scrap', label: 'Waste / Scrap', heading: '7204' },
  { value: 'granules_or_powders', label: 'Granules / Powders', heading: '7205' },
  { value: 'direct_reduction_sponge_iron', label: 'Direct Reduction / Sponge Iron', heading: '7203' },
  { value: 'pig_iron', label: 'Pig Iron / Spiegeleisen', heading: '7201' },
  { value: 'ferro_alloy', label: 'Ferro-alloy', heading: '7202' },
  { value: 'other', label: 'Other Iron / Steel', heading: '—' },
];

const PHYSICAL_FORMS: { value: PhysicalForm; label: string }[] = [
  { value: 'ingots_primary', label: 'Ingots / Primary Forms / Blocks' },
  { value: 'semi_finished', label: 'Semi-finished (billets, blooms, slabs)' },
  { value: 'flat_rolled', label: 'Flat-rolled Products' },
  { value: 'bars_rods_hot_rolled', label: 'Bars & Rods (hot-rolled, irregular coils)' },
  { value: 'bars_rods_other', label: 'Bars, Rods, Angles, Shapes & Sections' },
  { value: 'wire', label: 'Wire' },
  { value: 'angles_shapes', label: 'Angles, Shapes & Sections only' },
];

const CONFIDENCE_COLORS = {
  High: 'text-[#64FFDA] border-[#64FFDA] bg-[rgba(100,255,218,0.1)]',
  Medium: 'text-[#ffd166] border-[#ffd166] bg-[rgba(255,209,102,0.1)]',
  Low: 'text-[#ff5370] border-[#ff5370] bg-[rgba(255,83,112,0.1)]',
};

interface Props {
  onNext: () => void;
}

export const Step1_Classification = ({ onNext }: Props) => {
  const { classification, updateClassification, computeSteelClass, computeHSHeading, markStepComplete } =
    useShipmentStore();
  const [showClassificationResult, setShowClassificationResult] = useState(classification.classified);

  const isSpecialMaterial =
    classification.materialType !== 'other' && classification.materialType !== '';

  const handleClassify = () => {
    computeSteelClass();
    computeHSHeading();
    setShowClassificationResult(true);
  };

  const handleConfirmAndNext = () => {
    markStepComplete(1);
    onNext();
  };

  const headingInfo = (heading: string) => {
    const map: Record<string, string> = {
      '7201': 'Pig Iron and Spiegeleisen',
      '7202': 'Ferro-alloys',
      '7203': 'Ferrous products from direct reduction',
      '7204': 'Ferrous waste and scrap',
      '7205': 'Granules and powders',
      '7206': 'Iron and non-alloy steel ingots',
      '7207': 'Semi-finished products',
      '7208': 'Flat-rolled products (width ≥ 600mm, hot-rolled)',
      '7209': 'Flat-rolled products (width ≥ 600mm, cold-rolled)',
      '7210': 'Flat-rolled products (width ≥ 600mm, clad/plated)',
      '7211': 'Flat-rolled products (width < 600mm)',
      '7212': 'Flat-rolled products (width < 600mm, clad/plated)',
      '7213': 'Bars and rods (hot-rolled, irregular coils)',
      '7214': 'Bars and rods (other, forged/hot-rolled)',
      '7215': 'Bars and rods (other alloy or further processed)',
      '7216': 'Angles, shapes and sections',
      '7217': 'Wire',
      '7218': 'Stainless steel ingots / semi-finished',
      '7219': 'Flat-rolled stainless (width ≥ 600mm)',
      '7220': 'Flat-rolled stainless (width < 600mm)',
      '7221': 'Bars and rods, stainless (hot-rolled coils)',
      '7222': 'Bars, rods, angles — stainless other',
      '7223': 'Wire — stainless steel',
      '7224': 'Other alloy steel ingots / semi-finished',
      '7225': 'Flat-rolled other alloy (width ≥ 600mm)',
      '7226': 'Flat-rolled other alloy (width < 600mm)',
      '7227': 'Bars and rods, other alloy (hot-rolled coils)',
      '7228': 'Bars, rods, angles — other alloy',
      '7229': 'Wire — other alloy steel',
    };
    return map[heading] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Beaker size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 1 — Classify the Commodity Code
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            The 10-digit commodity code is the foundation of every compliance decision. HS Chapters 72 & 73.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.15)] rounded-lg p-4">
        <Info size={16} className="text-[#00e5ff] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-xs text-[var(--muted2)]">
          Only the first 6 digits of a commodity code are internationally standardised (the HS code). Digits 7–10
          are country-specific and must be validated against the destination country&apos;s database.
        </p>
      </div>

      {/* Step 1.1 — Chemical Composition Gate */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">1</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 1.1 — Chemical Composition Gate
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--muted2)] mb-4">
          What is the exact composition of the metal?
        </p>

        {/* Material Type */}
        <div className="mb-5">
          <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
            Material Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MATERIAL_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => updateClassification({ materialType: mt.value })}
                className={`text-left p-3 rounded-md border text-xs transition-all ${
                  classification.materialType === mt.value
                    ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]'
                    : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'
                }`}
              >
                <div className="font-bold">{mt.label}</div>
                {mt.heading !== '—' && (
                  <div className="text-[10px] text-[var(--cyan)] mt-0.5">→ Heading {mt.heading}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chemical percentages — only if materialType is 'other' */}
        {(classification.materialType === 'other' || !isSpecialMaterial) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'carbonPct', label: 'Carbon %', hint: '>2.0% → Pig Iron' },
              { key: 'chromiumPct', label: 'Chromium %', hint: '≥10.5% with C≤1.2% → Stainless' },
              { key: 'manganesePct', label: 'Manganese %', hint: '≥1.65% → Alloy Steel' },
              { key: 'aluminiumPct', label: 'Aluminium %', hint: '≥0.3% → Alloy Steel' },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block font-mono text-xs text-[var(--muted2)] mb-1">{label}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={(classification as unknown as Record<string, string>)[key] || ''}
                  onChange={(e) => updateClassification({ [key]: e.target.value } as Parameters<typeof updateClassification>[0])}
                  className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  placeholder="0.00"
                />
                <p className="text-[10px] text-[var(--muted2)] mt-1">{hint}</p>
              </div>
            ))}
          </div>
        )}

        {/* Other alloy elements toggle */}
        {classification.materialType === 'other' && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => updateClassification({ otherAlloyMet: !classification.otherAlloyMet })}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                classification.otherAlloyMet ? 'bg-[var(--cyan)]' : 'bg-[var(--s3)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  classification.otherAlloyMet ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="font-mono text-xs text-[var(--muted2)]">
              Other alloy minimums met (Si ≥ 0.6%, Nb ≥ 0.02%, V ≥ 0.04%, Ti ≥ 0.05%, etc.)
            </span>
          </div>
        )}
      </div>

      {/* Step 1.2 — Physical Form */}
      {(classification.materialType === 'other' || classification.steelClass) && (
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">2</div>
            <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Step 1.2 — Physical Form Assignment
            </h3>
          </div>

          <p className="font-mono text-xs text-[var(--muted2)] mb-4">
            What shape or form is the metal currently in?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {PHYSICAL_FORMS.map((pf) => (
              <button
                key={pf.value}
                onClick={() => updateClassification({ physicalForm: pf.value })}
                className={`text-left p-3 rounded-md border text-xs transition-all ${
                  classification.physicalForm === pf.value
                    ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]'
                    : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>

          {/* Width — only needed for flat-rolled */}
          {classification.physicalForm === 'flat_rolled' && (
            <div className="max-w-xs">
              <label className="block font-mono text-xs text-[var(--muted2)] mb-1">
                Strip Width (mm)
              </label>
              <input
                type="number"
                min="0"
                value={classification.widthMm}
                onChange={(e) => updateClassification({ widthMm: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="e.g. 750"
              />
              <p className="text-[10px] text-[var(--muted2)] mt-1">
                ≥600mm = Wide flat-rolled | &lt;600mm = Narrow flat-rolled
              </p>
            </div>
          )}
        </div>
      )}

      {/* Classify button */}
      <div className="flex justify-center">
        <button
          onClick={handleClassify}
          disabled={!classification.materialType}
          className="px-8 py-3 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Run Classification Engine
        </button>
      </div>

      {/* Step 1.3 — Classification Output */}
      {showClassificationResult && classification.hsHeading && (
        <div className="bg-[var(--s1)] border border-[rgba(100,255,218,0.3)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={18} className="text-[var(--cyan)]" />
            <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Step 1.3 — Classification Output
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[var(--s3)] rounded-lg p-4">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase mb-1">HS Heading</p>
              <p className="font-display text-2xl font-bold text-[var(--cyan)]">
                {classification.hsHeading}
              </p>
              <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">
                {headingInfo(classification.hsHeading)}
              </p>
            </div>

            <div className="bg-[var(--s3)] rounded-lg p-4">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase mb-1">Steel Class</p>
              <p className="font-mono text-sm font-bold text-[var(--text)]">
                {classification.steelClass
                  ? classification.steelClass.replace(/_/g, ' ')
                  : 'N/A (Special Material)'}
              </p>
            </div>

            <div className="bg-[var(--s3)] rounded-lg p-4">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase mb-1">Confidence</p>
              {classification.classificationConfidence && (
                <span
                  className={`inline-block font-mono text-sm font-bold px-2 py-1 rounded border ${
                    CONFIDENCE_COLORS[classification.classificationConfidence]
                  }`}
                >
                  {classification.classificationConfidence}
                </span>
              )}
            </div>

            <div className="bg-[var(--s3)] rounded-lg p-4">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase mb-1">Commodity Code (10-digit)</p>
              <p className="font-display text-base font-bold text-[var(--text)]">
                {classification.commodityCode || `${classification.hsHeading} XX XX`}
              </p>
              <p className="text-[10px] text-[var(--muted2)] mt-1">Validate via UK Trade Tariff API</p>
            </div>

            <div className="bg-[var(--s3)] rounded-lg p-4">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase mb-1">Supplementary Unit</p>
              <p className="font-mono text-sm font-bold text-[var(--text)]">{classification.supplementaryUnit}</p>
            </div>

            <div className="bg-[var(--s3)] rounded-lg p-4">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase mb-1">Flags</p>
              <div className="space-y-1">
                {classification.licenceRequired && (
                  <div className="flex items-center gap-1 text-[#ffd166]">
                    <AlertTriangle size={12} />
                    <span className="font-mono text-[10px]">Licence Required</span>
                  </div>
                )}
                {classification.safeguardFlag && (
                  <div className="flex items-center gap-1 text-[#ffd166]">
                    <AlertTriangle size={12} />
                    <span className="font-mono text-[10px]">Safeguard Measure</span>
                  </div>
                )}
                {classification.trqFlag && (
                  <div className="flex items-center gap-1 text-[#ffd166]">
                    <AlertTriangle size={12} />
                    <span className="font-mono text-[10px]">TRQ Applies</span>
                  </div>
                )}
                {!classification.licenceRequired && !classification.safeguardFlag && !classification.trqFlag && (
                  <span className="font-mono text-[10px] text-[var(--muted2)]">No special flags</span>
                )}
              </div>
            </div>
          </div>

          {/* API Attribution */}
          <div className="mt-4 p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
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
              . Classification data sourced from the UK Trade Tariff API (
              <a
                href="https://api.trade-tariff.service.gov.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--cyan)] underline"
              >
                api.trade-tariff.service.gov.uk
              </a>
              ).
            </p>
          </div>
        </div>
      )}

      {/* Error: no heading found */}
      {showClassificationResult && !classification.hsHeading && (
        <div className="flex gap-3 bg-[rgba(255,83,112,0.08)] border border-[rgba(255,83,112,0.3)] rounded-lg p-4">
          <AlertTriangle size={16} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-[#ff5370]">
            Unable to determine HS heading from inputs provided. Please check material type and
            physical form selections.
          </p>
        </div>
      )}

      {/* Next button */}
      {classification.classified && (
        <div className="flex justify-end">
          <button
            onClick={handleConfirmAndNext}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] text-black rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:bg-[var(--cyan-hover)] transition-colors"
          >
            Confirm & Continue
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
