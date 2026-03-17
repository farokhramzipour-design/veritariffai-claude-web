"use client";

import React from 'react';
import { ChevronRight, ChevronLeft, Info, CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { useShipmentStore, OriginProofMethod } from '@/lib/stores/shipmentStore';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PROOF_METHODS: { value: OriginProofMethod; label: string; desc: string }[] = [
  {
    value: 'statement_on_origin',
    label: 'Statement on Origin',
    desc: 'Declaration on commercial invoice, packing list or delivery note. Primary method under TCA Annex ORIG-4.',
  },
  {
    value: 'importers_knowledge',
    label: "Importer's Knowledge",
    desc: 'German importer claims preference based on their own knowledge of goods origin. Importer bears full customs liability.',
  },
  {
    value: 'other',
    label: 'Other / Non-preferential',
    desc: 'Goods not covered by UK-EU TCA. MFN rate applies. Potential anti-dumping, countervailing duties, or other measures.',
  },
];

const TCA_ORIGIN_TEXT = `The exporter of the products covered by this document (Exporter Reference No: [EORI/REX]) declares that, except where otherwise clearly indicated, these products are of [UK] preferential origin.

[Place and date]
[Signature]`;

export const Step2_RulesOfOrigin = ({ onNext, onBack }: Props) => {
  const { origin, updateOrigin, markStepComplete, classification } = useShipmentStore();

  const mfnRate = parseFloat(origin.mfnDutyRate) || 0;
  const dutyToSave = mfnRate > 0;
  const consignmentValue = parseFloat(origin.consignmentValueEUR) || 0;
  const needsEORI = consignmentValue > 6000 && origin.proofMethod === 'statement_on_origin';

  const handleGenerateStatement = () => {
    updateOrigin({ statementOnOriginGenerated: true, tcaPreferenceClaimed: true });
  };

  const handleNext = () => {
    markStepComplete(2);
    onNext();
  };

  const canProceed =
    origin.proofMethod !== '' &&
    (origin.proofMethod !== 'importers_knowledge' || origin.importersKnowledgeAcknowledged);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Globe size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 2 — Rules of Origin & Preferential Duty
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            MFN Gateway → Origin Proof Mechanism → TCA Preference (UK-EU Trade and Cooperation Agreement)
          </p>
        </div>
      </div>

      {/* Context */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-4">
        <p className="font-mono text-xs text-[var(--muted2)]">
          <span className="text-[var(--cyan)] font-bold">HS Heading from Step 1:</span>{' '}
          {classification.hsHeading || '—'}{' '}
          {classification.hsHeading && (
            <span className="text-[var(--muted2)]">
              (Chapter {classification.hsHeading.slice(0, 2)})
            </span>
          )}
        </p>
      </div>

      {/* Step 2.1 — MFN Gateway */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">1</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 2.1 — MFN Gateway
          </h3>
          <span className="font-mono text-xs text-[var(--muted2)]">Is there a duty to save?</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
              EU MFN Duty Rate for this CN Code (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={origin.mfnDutyRate}
              onChange={(e) => updateOrigin({ mfnDutyRate: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="0.0"
            />
            <p className="text-[10px] text-[var(--muted2)] mt-1">
              Check EU TARIC for exact CN subheading rate
            </p>
          </div>
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
              Consignment Value (EUR)
            </label>
            <input
              type="number"
              min="0"
              value={origin.consignmentValueEUR}
              onChange={(e) => updateOrigin({ consignmentValueEUR: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="e.g. 25000"
            />
            <p className="text-[10px] text-[var(--muted2)] mt-1">
              &gt;€6,000 requires EORI on Statement on Origin
            </p>
          </div>
        </div>

        {/* MFN decision */}
        {origin.mfnDutyRate !== '' && (
          <div
            className={`flex gap-3 rounded-lg p-4 border ${
              dutyToSave
                ? 'bg-[rgba(100,255,218,0.05)] border-[rgba(100,255,218,0.2)]'
                : 'bg-[rgba(255,209,102,0.05)] border-[rgba(255,209,102,0.2)]'
            }`}
          >
            {dutyToSave ? (
              <>
                <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-[var(--cyan)] font-bold">
                    Duty saving available — MFN rate {mfnRate}%
                  </p>
                  <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                    Prove UK origin to claim 0% preferential rate under UK-EU TCA. Proceed to Step 2.2.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Info size={16} className="text-[#ffd166] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-[#ffd166] font-bold">
                    Zero duty — MFN rate is 0%
                  </p>
                  <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                    No duty saving required. Veritariff still recommends recording TCA preference for audit trail completeness.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-3 flex gap-2 items-start bg-[rgba(0,0,0,0.2)] rounded-md p-3">
          <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
          <p className="font-mono text-[10px] text-[var(--muted2)]">
            For most Chapter 72 steel products, EU MFN rate = 0%. Chapter 73 articles may carry rates of
            2.7%–6%. Always check per specific 10-digit code via EU TARIC.
          </p>
        </div>
      </div>

      {/* Step 2.2 — Proof Method */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">2</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 2.2 — How Do You Prove Origin?
          </h3>
        </div>

        <div className="space-y-3 mb-5">
          {PROOF_METHODS.map((pm) => (
            <button
              key={pm.value}
              onClick={() => updateOrigin({ proofMethod: pm.value })}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                origin.proofMethod === pm.value
                  ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)]'
                  : 'border-[var(--border)] hover:border-[var(--border2)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    origin.proofMethod === pm.value
                      ? 'border-[var(--cyan)] bg-[var(--cyan)]'
                      : 'border-[var(--border2)]'
                  }`}
                />
                <div>
                  <p className="font-mono text-sm font-bold text-[var(--text)]">{pm.label}</p>
                  <p className="font-mono text-xs text-[var(--muted2)] mt-0.5">{pm.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Statement on Origin — EORI requirement */}
        {origin.proofMethod === 'statement_on_origin' && (
          <div className="space-y-4">
            {needsEORI && (
              <div>
                <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
                  UK Exporter EORI Number (required — consignment &gt; €6,000)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={origin.eoriNumber}
                    onChange={(e) => updateOrigin({ eoriNumber: e.target.value })}
                    className="flex-1 bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                    placeholder="GB123456789012"
                  />
                </div>
                <p className="text-[10px] text-[var(--muted2)] mt-1">
                  GB + 12 digits. For EU exporters use REX (Registered Exporter) number instead.
                </p>
                {origin.eoriNumber && !/^GB\d{12}$/.test(origin.eoriNumber) && (
                  <p className="text-[10px] text-[#ff5370] mt-1">
                    EORI format: GB followed by exactly 12 digits
                  </p>
                )}
              </div>
            )}

            {/* Generate Statement */}
            <div className="border border-[var(--border)] rounded-lg p-4">
              <p className="font-mono text-xs text-[var(--muted2)] mb-3 uppercase tracking-wider">
                TCA Annex ORIG-4 — Statement on Origin Text
              </p>
              <pre className="font-mono text-xs text-[var(--text)] bg-[var(--s3)] rounded-md p-4 whitespace-pre-wrap border border-[var(--border)]">
                {TCA_ORIGIN_TEXT.replace('[EORI/REX]', origin.eoriNumber || '[EORI/REX]')}
              </pre>
              <p className="font-mono text-[10px] text-[var(--muted2)] mt-3">
                Place this text on: Commercial Invoice OR Packing List OR Delivery Note
              </p>
              <button
                onClick={handleGenerateStatement}
                className="mt-3 px-4 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] transition-colors"
              >
                {origin.statementOnOriginGenerated ? '✓ Statement Generated' : 'Generate Statement on Origin'}
              </button>
            </div>
          </div>
        )}

        {/* Importer's Knowledge — warning */}
        {origin.proofMethod === 'importers_knowledge' && (
          <div className="bg-[rgba(255,83,112,0.05)] border border-[rgba(255,83,112,0.3)] rounded-lg p-4">
            <div className="flex gap-3 mb-3">
              <AlertTriangle size={16} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
              <p className="font-mono text-xs text-[#ff5370] font-bold">
                Liability Warning — Importer&apos;s Knowledge
              </p>
            </div>
            <p className="font-mono text-xs text-[var(--muted2)] mb-4">
              Under Importer&apos;s Knowledge (TCA Art. ORIG.19), the German importer bears{' '}
              <strong className="text-[var(--text)]">full customs liability</strong> if their knowledge
              is subsequently found to be incorrect. Documentary evidence must be held by the importer.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={origin.importersKnowledgeAcknowledged}
                onChange={(e) => updateOrigin({ importersKnowledgeAcknowledged: e.target.checked })}
                className="mt-0.5 accent-[var(--cyan)]"
              />
              <span className="font-mono text-xs text-[var(--text)]">
                I confirm the German importer has been notified of their liability and will hold
                supporting commercial evidence. TCA Art. ORIG.19 acknowledged.
              </span>
            </label>
          </div>
        )}

        {/* Other / Non-preferential */}
        {origin.proofMethod === 'other' && (
          <div className="bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.2)] rounded-lg p-4">
            <p className="font-mono text-xs text-[#ffd166] font-bold mb-2">
              Non-preferential Rules of Origin Apply
            </p>
            <p className="font-mono text-xs text-[var(--muted2)] mb-3">
              MFN rate applies. The following commercial policy measures may be triggered:
            </p>
            <ul className="space-y-1">
              {[
                'Anti-dumping duties',
                'Countervailing duties',
                'Trade embargoes',
                'Safeguarding measures',
                'Quantitative restrictions',
                'Tariff quotas (TRQs)',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 font-mono text-xs text-[var(--muted2)]">
                  <span className="text-[#ffd166]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* REF */}
      <div className="flex gap-2 items-start p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
        <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-[var(--muted2)]">
          Reg ref: TCA Annex ORIG-4 · TCA Art. ORIG.17 (REX) · TCA Art. ORIG.19 (Importer&apos;s Knowledge) ·
          UK Gov Guidance: Claiming preferential tariffs in UK-EU trade · EU TARIC Database
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
          Continue to Sanctions
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
