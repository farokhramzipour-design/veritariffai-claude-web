"use client";

import React from 'react';
import { ChevronRight, ChevronLeft, Building2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useShipmentStore } from '@/lib/stores/shipmentStore';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CUSTOMS_OFFICES = [
  { code: '0313000', name: 'Hamburg' },
  { code: '0400000', name: 'Bremen' },
  { code: '4204000', name: 'Duisburg' },
  { code: '5203000', name: 'Cologne' },
  { code: '6004500', name: 'Frankfurt Airport' },
];

export const Step4_GermanCustoms = ({ onNext, onBack }: Props) => {
  const { germanCustoms, updateGermanCustoms, markStepComplete, origin, cds } = useShipmentStore();

  const cifValue = parseFloat(germanCustoms.cifValueEUR) || 0;
  const dutyRate = parseFloat(germanCustoms.dutyRate) || 0;
  const customsDuty = (cifValue * dutyRate) / 100;
  const eust = (cifValue + customsDuty) * 0.19;

  const handleEustCalculate = () => {
    updateGermanCustoms({ eustAmount: eust.toFixed(2) });
  };

  const handleNext = () => {
    markStepComplete(4);
    onNext();
  };

  const canProceed =
    germanCustoms.safeguardApplicable !== null &&
    (!germanCustoms.siglDocumentRequired || germanCustoms.siglDocumentRef) &&
    germanCustoms.importerEORI;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 4 — German Customs (Zoll) Import Gateway
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            EU Import — Surveillance, ATLAS Declaration, EUSt (Einfuhrumsatzsteuer)
          </p>
        </div>
      </div>

      {/* Step 4.1 — Safeguard & SIGL */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">1</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 4.1 — Steel Safeguard & Surveillance Check (SIGL)
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--muted2)] mb-4">
          Is the commodity code subject to EU steel safeguard measures (Regulation 2019/159)?
        </p>

        {/* Safeguard Yes/No */}
        <div className="grid grid-cols-2 gap-3 mb-5 max-w-sm">
          {[
            { val: true, label: 'YES — Subject to Safeguard' },
            { val: false, label: 'NO — No Safeguard Applies' },
          ].map(({ val, label }) => (
            <button
              key={String(val)}
              onClick={() => updateGermanCustoms({ safeguardApplicable: val })}
              className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                germanCustoms.safeguardApplicable === val
                  ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]'
                  : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Safeguard = YES */}
        {germanCustoms.safeguardApplicable === true && (
          <div className="space-y-4">
            {/* TRQ */}
            <div>
              <p className="font-mono text-xs text-[var(--muted2)] mb-3">
                TRQ (Tariff Rate Quota) status for UK origin:
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { val: true, label: 'Quota Remaining', color: 'cyan' },
                  { val: false, label: 'Quota Exhausted', color: 'red' },
                ].map(({ val, label, color }) => (
                  <button
                    key={String(val)}
                    onClick={() => updateGermanCustoms({ trqQuotaRemaining: val })}
                    className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                      germanCustoms.trqQuotaRemaining === val
                        ? color === 'cyan'
                          ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]'
                          : 'border-[#ff5370] bg-[rgba(255,83,112,0.08)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {germanCustoms.trqQuotaRemaining === false && (
              <div className="flex gap-3 bg-[rgba(255,83,112,0.06)] border border-[rgba(255,83,112,0.3)] rounded-lg p-4">
                <AlertTriangle size={16} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-[#ff5370] font-bold">
                    ALERT: 25% safeguard duty will apply
                  </p>
                  <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                    Notify importer urgently — commercial decision required. UK TRQ allocation is
                    exhausted for this quota period.
                  </p>
                </div>
              </div>
            )}

            {/* SIGL */}
            <div className="border border-[var(--border2)] rounded-lg p-4 bg-[rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-[#ffd166]" />
                <p className="font-mono text-xs text-[#ffd166] font-bold">
                  SIGL Surveillance Document Required (EU Reg 2015/478)
                </p>
              </div>
              <p className="font-mono text-xs text-[var(--muted2)] mb-3">
                German importer must obtain SIGL Surveillance Document via BAFA portal BEFORE
                shipment departs UK.
              </p>
              <div>
                <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
                  SIGL Document Reference Number
                </label>
                <input
                  type="text"
                  value={germanCustoms.siglDocumentRef}
                  onChange={(e) => {
                    updateGermanCustoms({
                      siglDocumentRef: e.target.value,
                      siglDocumentRequired: true,
                    });
                  }}
                  className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  placeholder="BAFA SIGL reference"
                />
                <p className="text-[10px] text-[var(--muted2)] mt-1">
                  Obtain via:{' '}
                  <span className="text-[var(--cyan)]">bafa.de</span> — Bundesamt für Wirtschaft
                  und Ausfuhrkontrolle
                </p>
              </div>
            </div>
          </div>
        )}

        {germanCustoms.safeguardApplicable === false && (
          <div className="flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
            <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-[var(--cyan)]">
              No safeguard applies. Proceed to ATLAS import declaration.
            </p>
          </div>
        )}
      </div>

      {/* Step 4.2 — ATLAS Import Declaration */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">2</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 4.2 — German ATLAS H1 Import Declaration
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              German Importer EORI (DE + 9 digits)
            </label>
            <input
              type="text"
              value={germanCustoms.importerEORI}
              onChange={(e) => updateGermanCustoms({ importerEORI: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="DE123456789"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              DE Customs Office Code (ATLAS)
            </label>
            <select
              value={germanCustoms.customsOfficeCode}
              onChange={(e) => updateGermanCustoms({ customsOfficeCode: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
            >
              <option value="">Select office</option>
              {CUSTOMS_OFFICES.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.code} — {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              Customs Value — CIF (EUR)
            </label>
            <input
              type="number"
              min="0"
              value={germanCustoms.cifValueEUR}
              onChange={(e) => updateGermanCustoms({ cifValueEUR: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="CIF value in EUR"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              German VAT Number (USTID)
            </label>
            <input
              type="text"
              value={germanCustoms.importerVATNumber}
              onChange={(e) => updateGermanCustoms({ importerVATNumber: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="DE123456789"
            />
            <p className="text-[10px] text-[var(--muted2)] mt-1">
              Required for EUSt input tax deduction
            </p>
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2">
              CBAM Declarant ID (if applicable)
            </label>
            <input
              type="text"
              value={germanCustoms.cbamDeclarantId}
              onChange={(e) => updateGermanCustoms({ cbamDeclarantId: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="CBAM Registry number"
            />
          </div>
        </div>

        {/* Duty Rate — auto from Step 2 */}
        <div className="bg-[var(--s3)] rounded-lg p-4 mb-4">
          <p className="font-mono text-xs text-[var(--muted2)] font-bold mb-3 uppercase tracking-wider">
            Duty Rate Determination
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[10px] text-[var(--muted2)]">RoO Proof Valid?</p>
              <p className={`font-mono text-sm font-bold ${origin.proofMethod && origin.proofMethod !== 'other' ? 'text-[var(--cyan)]' : 'text-[#ffd166]'}`}>
                {origin.proofMethod && origin.proofMethod !== 'other' ? 'YES' : 'NO / UNKNOWN'}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted2)]">Applied Duty Rate</p>
              <p className="font-mono text-sm font-bold text-[var(--text)]">
                {origin.proofMethod && origin.proofMethod !== 'other' ? '0% (TCA Preferential)' : `${origin.mfnDutyRate || 0}% (MFN)`}
              </p>
            </div>
          </div>
        </div>

        {/* EUSt Calculator */}
        {germanCustoms.cifValueEUR && (
          <div className="bg-[var(--s3)] rounded-lg p-4 border border-[rgba(0,229,255,0.1)]">
            <p className="font-mono text-xs text-[var(--muted2)] font-bold mb-3 uppercase tracking-wider">
              EUSt — Einfuhrumsatzsteuer (Import VAT)
            </p>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="font-mono text-[10px] text-[var(--muted2)]">CIF Customs Value</p>
                <p className="font-mono text-sm text-[var(--text)]">€{cifValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-[var(--muted2)]">Customs Duty</p>
                <p className="font-mono text-sm text-[var(--text)]">€{customsDuty.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-[var(--muted2)]">EUSt (19%)</p>
                <p className="font-mono text-sm font-bold text-[#00e5ff]">€{eust.toFixed(2)}</p>
              </div>
            </div>
            <p className="font-mono text-[10px] text-[var(--muted2)]">
              Formula: 19% × (CIF value + customs duty).{' '}
              {germanCustoms.importerVATNumber
                ? 'EUSt deductible as input VAT on German VAT return (importer has USTID).'
                : 'Provide German VAT number for EUSt input tax relief.'}
            </p>
            <button
              onClick={handleEustCalculate}
              className="mt-2 px-3 py-1.5 bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)] text-[#00e5ff] rounded font-mono text-xs hover:bg-[rgba(0,229,255,0.15)] transition-colors"
            >
              Save EUSt Calculation
            </button>
          </div>
        )}
      </div>

      {/* Reg ref */}
      <div className="flex gap-2 items-start p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
        <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-[var(--muted2)]">
          Reg ref: EU UCC Reg 952/2013 · German Zollverwaltungsgesetz · ATLAS System v4.0 · EU
          Safeguard Reg 2019/159 · EU TARIC · zoll.de · bafa.de
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
          Continue to CBAM
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
