"use client";

import React from 'react';
import { ChevronRight, ChevronLeft, FileText, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useShipmentStore, ExitRoute } from '@/lib/stores/shipmentStore';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const INCOTERMS = [
  'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
];

const PROCEDURE_CODES = [
  { code: '10 00', desc: 'Permanent export' },
  { code: '21 00', desc: 'Outward Processing (OP)' },
  { code: '31 00', desc: 'Re-export' },
];

const EXIT_ROUTES: { value: ExitRoute; label: string; timing: string }[] = [
  { value: 'RoRo', label: 'Roll-on / Roll-off', timing: 'EXS at least 2 hours before departure' },
  { value: 'container_sea', label: 'Container (Sea)', timing: 'EXS at least 24 hours before loading' },
  { value: 'air_freight', label: 'Air Freight', timing: 'EXS at least 30 minutes before departure' },
];

export const Step6_CDS = ({ onNext, onBack }: Props) => {
  const { cds, updateCDS, markStepComplete, classification } = useShipmentStore();

  const exportValue = parseFloat(cds.exportValueGBP) || 0;
  const requiresFullDeclaration = exportValue >= 1500;

  const handleGenerateMRN = () => {
    // Simulate MRN generation
    const mrn = `23GB${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    updateCDS({ mrn });
  };

  const handleNext = () => {
    markStepComplete(6);
    onNext();
  };

  const canProceed =
    cds.exporterEORI &&
    cds.netMassKg &&
    cds.deliveryTerms &&
    cds.exitVia !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <FileText size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 6 — HMRC CDS Export Declaration
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            Customs Declaration Service — UK Export Data Elements (pre-lodged before goods reach UK frontier)
          </p>
        </div>
      </div>

      {/* Step 6.1 — Declaration Type */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">1</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 6.1 — Declaration Type Gate
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              Export Value (GBP)
            </label>
            <input
              type="number"
              min="0"
              value={cds.exportValueGBP}
              onChange={(e) => updateCDS({ exportValueGBP: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="e.g. 25000"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              Declaration Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'EX' as const, label: 'EX — Standard Export' },
                { val: 'CO' as const, label: 'CO — Outward Processing' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => updateCDS({ declarationType: val })}
                  className={`p-3 rounded-md border text-xs font-mono text-left transition-all ${
                    cds.declarationType === val
                      ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {cds.exportValueGBP && (
          <div className={`flex gap-3 rounded-lg p-3 border ${
            requiresFullDeclaration
              ? 'bg-[rgba(100,255,218,0.05)] border-[rgba(100,255,218,0.2)]'
              : 'bg-[rgba(255,209,102,0.05)] border-[rgba(255,209,102,0.2)]'
          }`}>
            {requiresFullDeclaration ? (
              <>
                <CheckCircle size={14} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-[var(--cyan)]">
                  Full Export Declaration required (EX procedure type) — value ≥ £1,500. Pre-lodge
                  before goods arrive at frontier.
                </p>
              </>
            ) : (
              <>
                <Info size={14} className="text-[#ffd166] flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-[#ffd166]">
                  Simplified Declaration may be used (value &lt; £1,500). Note: sanctioned steel grades
                  require full declaration regardless of value.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Step 6.2 — Core Data Elements */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">2</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 6.2 — Core CDS Data Elements
          </h3>
        </div>

        {/* Header DEs */}
        <div className="mb-5">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
            Header Data Elements
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 3/1 — Exporter EORI (GB + 12 digits)
              </label>
              <input
                type="text"
                value={cds.exporterEORI}
                onChange={(e) => updateCDS({ exporterEORI: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="GB123456789012"
              />
              {cds.exporterEORI && !/^GB\d{12}$/.test(cds.exporterEORI) && (
                <p className="text-[10px] text-[#ff5370] mt-1">Format: GB + 12 digits</p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 1/10 — Procedure Code
              </label>
              <select
                value={cds.procedureCode}
                onChange={(e) => updateCDS({ procedureCode: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              >
                {PROCEDURE_CODES.map((pc) => (
                  <option key={pc.code} value={pc.code}>
                    {pc.code} — {pc.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 5/8 — Country of Destination
              </label>
              <input
                type="text"
                value={cds.countryOfDestination}
                onChange={(e) => updateCDS({ countryOfDestination: e.target.value.toUpperCase() })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="DE"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 5/14 — Country of Dispatch
              </label>
              <input
                type="text"
                value={cds.countryOfDispatch}
                readOnly
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--muted2)] font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Goods DEs */}
        <div className="mb-5">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
            Goods Data Elements
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 6/8 — Commodity Code (10-digit UK Tariff)
              </label>
              <input
                type="text"
                value={classification.commodityCode}
                readOnly
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--muted2)] font-mono cursor-not-allowed"
                placeholder="Auto-populated from Step 1"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 6/1 — Net Mass (kg)
              </label>
              <input
                type="number"
                min="0"
                value={cds.netMassKg}
                onChange={(e) => updateCDS({ netMassKg: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="Weight excl. packaging"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 6/5 — Gross Mass (kg)
              </label>
              <input
                type="number"
                min="0"
                value={cds.grossMassKg}
                onChange={(e) => updateCDS({ grossMassKg: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="Total incl. packaging"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 6/2 — Supplementary Units
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={cds.supplementaryUnits}
                  onChange={(e) => updateCDS({ supplementaryUnits: e.target.value })}
                  className="flex-1 bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  placeholder="Quantity"
                />
                <span className="bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--muted2)] font-mono whitespace-nowrap">
                  {classification.supplementaryUnit || 'tonnes'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Valuation DEs */}
        <div>
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
            Valuation Data Elements
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 4/1 — Delivery Terms (Incoterms 2020)
              </label>
              <select
                value={cds.deliveryTerms}
                onChange={(e) => updateCDS({ deliveryTerms: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              >
                <option value="">Select Incoterm</option>
                {INCOTERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 4/14 — Invoice Currency (ISO 4217)
              </label>
              <select
                value={cds.invoiceCurrency}
                onChange={(e) => updateCDS({ invoiceCurrency: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              >
                {['GBP', 'EUR', 'USD', 'CHF', 'JPY', 'CNY'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                DE 4/16 — Valuation Method
              </label>
              <select
                value={cds.valuationMethod}
                onChange={(e) => updateCDS({ valuationMethod: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              >
                <option value="1">Method 1 — Transaction Value (preferred)</option>
                <option value="2">Method 2 — Identical Goods</option>
                <option value="3">Method 3 — Similar Goods</option>
                <option value="4">Method 4 — Deductive</option>
                <option value="5">Method 5 — Computed</option>
                <option value="6">Method 6 — Fall-back</option>
              </select>
            </div>
          </div>

          {cds.invoiceCurrency !== 'GBP' && (
            <div className="mt-3 flex gap-2 items-center bg-[rgba(0,0,0,0.2)] rounded-md p-3">
              <Info size={12} className="text-[var(--muted2)] flex-shrink-0" />
              <p className="font-mono text-[10px] text-[var(--muted2)]">
                Non-GBP invoice: auto-convert using HMRC weekly exchange rate (
                <span className="text-[var(--cyan)]">gov.uk/government/collections/exchange-rates-for-customs</span>
                )
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 6.3 — Exit Summary Declaration */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">3</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 6.3 — Safety & Security Exit Summary (EXS)
          </h3>
        </div>

        {/* AEO Status */}
        <div className="mb-4">
          <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
            AEO Authorisation Status
          </label>
          <div className="grid grid-cols-3 gap-2 max-w-md">
            {[
              { val: 'NONE' as const, label: 'Not AEO' },
              { val: 'AEOC' as const, label: 'AEOC (Customs)' },
              { val: 'AEOS' as const, label: 'AEOS (Security)' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => updateCDS({ aeoStatus: val, exsRequired: val === 'NONE' })}
                className={`p-3 rounded-md border text-xs font-mono transition-all ${
                  cds.aeoStatus === val
                    ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]'
                    : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {cds.aeoStatus !== 'NONE' ? (
          <div className="flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4 mb-4">
            <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0" />
            <p className="font-mono text-xs text-[var(--cyan)]">
              AEO {cds.aeoStatus} status — EXS waived. Exit Summary exemption flagged.
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block font-mono text-xs text-[var(--muted2)] mb-3">
              Exit Route (for EXS timing requirements)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXIT_ROUTES.map((route) => (
                <button
                  key={route.value}
                  onClick={() => updateCDS({ exitVia: route.value })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    cds.exitVia === route.value
                      ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)]'
                      : 'border-[var(--border)] hover:border-[var(--border2)]'
                  }`}
                >
                  <p className="font-mono text-xs font-bold text-[var(--text)]">{route.label}</p>
                  <p className="font-mono text-[10px] text-[#ffd166] mt-1">⏱ {route.timing}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MRN Generation */}
        <div className="bg-[var(--s3)] rounded-lg p-4">
          <p className="font-mono text-xs text-[var(--muted2)] mb-3 uppercase tracking-wider">
            CDS Movement Reference Number (MRN)
          </p>
          {cds.mrn ? (
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-[var(--cyan)]" />
              <span className="font-mono text-sm font-bold text-[var(--cyan)]">{cds.mrn}</span>
              <button
                onClick={() => updateCDS({ mrn: '' })}
                className="text-[10px] text-[var(--muted2)] hover:text-[var(--text)] ml-auto"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateMRN}
              disabled={!canProceed}
              className="px-4 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Generate CDS Declaration & MRN
            </button>
          )}
          <p className="font-mono text-[10px] text-[var(--muted2)] mt-2">
            Real implementation: submits to HMRC CDS via GOV.UK API. Validate EORI via HMRC checker
            before lodgement.
          </p>
        </div>
      </div>

      {/* Reg ref */}
      <div className="flex gap-2 items-start p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
        <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-[var(--muted2)]">
          Reg ref: UK Tariff Vol 3: Data Elements for CDS Export · HMRC Notice 252 (Customs Valuation) ·
          WTO Valuation Agreement · HMRC EORI Checker API (api.service.hmrc.gov.uk/customs/eori)
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
          Build Barrister&apos;s Bundle
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
