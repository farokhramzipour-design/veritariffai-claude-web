"use client";

import React, { useRef } from 'react';
import {
  ChevronRight, ChevronLeft, Globe, Info, CheckCircle, AlertTriangle,
  XCircle, Upload, FileText, Zap, Shield, Search, AlertOctagon,
} from 'lucide-react';
import { useShipmentStore } from '@/lib/stores/shipmentStore';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

// ─── Sufficient processing ops (Gate 3D) ─────────────────────────────────────
const SUFFICIENT_OPS = [
  { id: 'eaf_melt', label: 'EAF Melting + Continuous Casting', sufficient: true },
  { id: 'hot_rolling', label: 'Hot Rolling from UK-melt billet', sufficient: true },
  { id: 'cold_rolling', label: 'Cold Rolling / Cold Drawing', sufficient: true },
  { id: 'heat_treatment', label: 'Heat Treatment (Quench / Temper)', sufficient: true },
  { id: 'cutting', label: 'Cutting to Length Only', sufficient: false },
  { id: 'surface_treatment', label: 'Surface Treatment (Pickling / Coating)', sufficient: false },
  { id: 'bundling', label: 'Bundling / Packaging / Relabelling', sufficient: false },
  { id: 'mixing', label: 'Mixing Without Melting', sufficient: false },
];

// TCA Annex ORIG-4 wording
const TCA_WORDING = `The exporter of the products covered by this document (Exporter Reference No: [EORI]) declares that, except where otherwise clearly indicated, these products are of United Kingdom preferential origin.`;

// ─── Section badge ────────────────────────────────────────────────────────────
function GateHeader({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-6 h-6 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {num}
      </div>
      <div>
        <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">{title}</h3>
        {sub && <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ children, highlight }: { children: React.ReactNode; highlight?: 'red' | 'amber' | 'cyan' }) {
  const border = highlight === 'red' ? 'border-[rgba(255,83,112,0.3)]' : highlight === 'amber' ? 'border-[rgba(255,209,102,0.3)]' : 'border-[var(--border)]';
  return (
    <div className={`bg-[var(--s1)] border ${border} rounded-lg p-6`}>
      {children}
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({
  label, fileName, uploaded, onChange,
}: {
  label: string; fileName: string; uploaded: boolean; onChange: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input ref={ref} type="file" accept=".pdf,.docx,.jpg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${uploaded ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.05)]' : 'border-[var(--border2)] hover:border-[var(--cyan)] hover:bg-[rgba(100,255,218,0.03)]'}`}
      >
        <Upload size={20} className={`mx-auto mb-2 ${uploaded ? 'text-[var(--cyan)]' : 'text-[var(--muted2)]'}`} />
        {uploaded ? (
          <div>
            <p className="font-mono text-xs text-[var(--cyan)] font-bold">{fileName}</p>
            <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">Click to replace</p>
          </div>
        ) : (
          <div>
            <p className="font-mono text-xs text-[var(--text)] font-bold">{label}</p>
            <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">PDF / DOCX / JPG / PNG · max 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const Step2_RulesOfOrigin = ({ onNext, onBack }: Props) => {
  const { origin, updateOrigin, markStepComplete, classification } = useShipmentStore();

  const mfnRate = parseFloat(origin.mfnDutyRate) || 0;
  const consignmentValue = parseFloat(origin.consignmentValueEUR) || 0;
  const needsEORI = consignmentValue > 6000;

  // Derived: can the wizard proceed to TRQ after origin result?
  const showTRQ = origin.originResult === 'UK_ORIGINATING' || origin.documentPath === 'quick_path';
  const showGate5 = origin.originResult === 'NOT_ORIGINATING';

  // ── Gate 2: Document handlers ──
  const handleSupplierDecUpload = (f: File) => {
    updateOrigin({ supplierDeclarationUploaded: true, supplierDeclarationFileName: f.name });
  };
  const handleStatementUpload = (f: File) => {
    updateOrigin({ statementOfOriginUploaded: true, statementOfOriginFileName: f.name });
  };

  const handleValidateDocuments = () => {
    const hasSoO = origin.statementOfOriginUploaded;
    // Simulate issue date validation: if date entered, check within 1 year
    let valid = true;
    if (hasSoO && origin.statementOfOriginIssueDate) {
      const issue = new Date(origin.statementOfOriginIssueDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      valid = issue >= oneYearAgo;
    }
    updateOrigin({
      statementOfOriginValid: valid,
      documentPath: (origin.supplierDeclarationUploaded || origin.statementOfOriginUploaded) ? 'quick_path' : 'wizard',
    });
  };

  const handleUseWizard = () => {
    updateOrigin({ documentPath: 'wizard' });
  };

  // ── Gate 3B: PSR / Melt+Pour ──
  const handleDeriveOrigin3B = () => {
    const melt = origin.meltCountry.toUpperCase();
    const pour = origin.pourCountry.toUpperCase();
    const bothUK = melt === 'GB' && pour === 'GB';
    const meltRU = melt === 'RU';

    if (meltRU) {
      updateOrigin({ cthSatisfied: false, originResult: 'NOT_ORIGINATING', originBasis: 'Melt origin = RU — BLOCKED' });
      return;
    }
    // Check if sufficient ops include EAF melt (CTH-conferring)
    const hasSufficientOp = origin.sufficientOps.includes('eaf_melt') || origin.sufficientOps.includes('hot_rolling') || origin.sufficientOps.includes('cold_rolling') || origin.sufficientOps.includes('heat_treatment');

    if (bothUK && hasSufficientOp) {
      updateOrigin({ cthSatisfied: true });
    } else if (!bothUK && hasSufficientOp && origin.euInputsPresent && origin.cumulationApplied) {
      // Cumulation path
      updateOrigin({ cthSatisfied: true });
    } else {
      updateOrigin({ cthSatisfied: false });
    }
  };

  // ── Gate 3E: Determine Origin ──
  const handleDetermineOrigin = () => {
    if (origin.whollyObtained === true) {
      updateOrigin({ originResult: 'UK_ORIGINATING', originBasis: 'Wholly Obtained — TCA Art.ORIG.5', cumulationStatement: 'No cumulation applied' });
      return;
    }
    const hasSufficientOp = origin.sufficientOps.some(op => SUFFICIENT_OPS.find(o => o.id === op)?.sufficient);
    const melt = origin.meltCountry.toUpperCase();
    const pour = origin.pourCountry.toUpperCase();
    const meltRU = melt === 'RU';

    if (meltRU) {
      updateOrigin({ originResult: 'NOT_ORIGINATING', originBasis: 'RU melt origin — BLOCKED' });
      return;
    }

    if (origin.cthSatisfied && hasSufficientOp) {
      if (origin.cumulationApplied) {
        updateOrigin({ originResult: 'UK_ORIGINATING', originBasis: 'CTH + EU Cumulation (TCA Art.ORIG.3)', cumulationStatement: 'Cumulation applied with EU' });
      } else {
        updateOrigin({ originResult: 'UK_ORIGINATING', originBasis: 'CTH + Melt/Pour UK (TCA Art.ORIG.19)', cumulationStatement: 'No cumulation applied' });
      }
    } else {
      updateOrigin({ originResult: 'NOT_ORIGINATING', originBasis: 'CTH not satisfied / insufficient processing' });
    }
  };

  // ── Gate 3F: Generate Statement ──
  const handleGenerateStatement = () => {
    const text = TCA_WORDING
      .replace('[EORI]', origin.eoriNumber || '[GB EORI]')
      + `\n\n${origin.cumulationStatement || 'No cumulation applied'}`;
    updateOrigin({ statementOnOriginGenerated: true, statementOnOriginText: text, tcaPreferenceClaimed: true });
  };

  // ── TRQ stub ──
  const handleFetchTRQ = () => {
    // Stub — real: call EU TARIC quota API
    updateOrigin({ trqStatus: 'in_quota', trqPercentRemaining: 43 });
  };

  // ── CSL stub ──
  const handleScreenCSL = () => {
    // Stub — real: call ITA CSL API at api.trade.gov
    if (!origin.cslPartyName.trim()) return;
    updateOrigin({ cslScreeningStatus: 'PASS', cslMatchedEntity: null, cslConfidenceScore: 0 });
  };

  const handleNext = () => {
    markStepComplete(2);
    onNext();
  };

  const canProceed =
    origin.trqStatus !== null &&
    origin.cslScreeningStatus !== null &&
    origin.cslScreeningStatus !== 'HARD_BLOCK' &&
    (showTRQ || showGate5) &&
    origin.trqStatus !== 'exhausted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Globe size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 2 — Rules of Origin, TRQ & Screening
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            MFN Gateway → Document Upload → RoO Wizard (Gates 3A–3F) → TRQ Live Screen → Entity Screening
          </p>
        </div>
      </div>

      {/* ── GATE 1: MFN Gateway ── */}
      <Section>
        <GateHeader num="1" title="Gate 1 — MFN Gateway" sub="Is there a customs duty to save?" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
              EU MFN Duty Rate for this CN Code (%)
            </label>
            <input
              type="number" step="0.1" min="0" max="100"
              value={origin.mfnDutyRate}
              onChange={(e) => updateOrigin({ mfnDutyRate: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="0.0"
            />
            <p className="text-[10px] text-[var(--muted2)] mt-1">HS 7224 = 0% MFN. Check EU TARIC for exact CN rate.</p>
          </div>
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
              Consignment Value (EUR)
            </label>
            <input
              type="number" min="0"
              value={origin.consignmentValueEUR}
              onChange={(e) => updateOrigin({ consignmentValueEUR: e.target.value })}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="e.g. 25000"
            />
            <p className="text-[10px] text-[var(--muted2)] mt-1">&gt;€6,000 requires EORI on Statement on Origin</p>
          </div>
        </div>

        {origin.mfnDutyRate !== '' && (
          <div className={`flex gap-3 rounded-lg p-4 border ${mfnRate > 0 ? 'bg-[rgba(100,255,218,0.05)] border-[rgba(100,255,218,0.2)]' : 'bg-[rgba(255,209,102,0.05)] border-[rgba(255,209,102,0.2)]'}`}>
            {mfnRate > 0 ? (
              <>
                <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-[var(--cyan)]">
                  <strong>Duty saving available — MFN {mfnRate}%.</strong> Prove UK origin to claim 0% TCA preferential rate.
                </p>
              </>
            ) : (
              <>
                <Info size={16} className="text-[#ffd166] flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-[#ffd166]">
                  <strong>MFN = 0%.</strong> TCA optional for duty saving. Safeguard TRQ still mandatory. Exception: melt=RU → HARD BLOCK.
                </p>
              </>
            )}
          </div>
        )}

        {/* Melt origin Russia block */}
        <div className="mt-3 flex gap-2 items-start bg-[rgba(255,83,112,0.05)] border border-[rgba(255,83,112,0.2)] rounded-md p-3">
          <XCircle size={12} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
          <p className="font-mono text-[10px] text-[#ff5370]">
            Exception: If melt origin = RU → HARD BLOCK regardless of MFN rate or subsequent processing.
          </p>
        </div>
      </Section>

      {/* ── GATE 2: Document Upload ── */}
      {origin.mfnDutyRate !== '' && (
        <Section>
          <GateHeader num="2" title="Gate 2 — Document Upload" sub="Supplier's Declaration (TCA Annex ORIG-3) + Statement of Origin (TCA Annex ORIG-4)" />

          <p className="font-mono text-xs text-[var(--muted2)] mb-5">
            Upload either or both. If neither uploaded, the wizard below (Gates 3A–3F) will gather the required information to generate documents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <p className="font-mono text-xs text-[var(--muted2)] mb-2 font-bold uppercase tracking-wider">Supplier's Declaration</p>
              <p className="font-mono text-[10px] text-[var(--muted2)] mb-3">TCA Annex ORIG-3 — goods ID, origin statement, non-originating materials, cumulation, signatory</p>
              <UploadZone
                label="Upload Supplier's Declaration"
                fileName={origin.supplierDeclarationFileName}
                uploaded={origin.supplierDeclarationUploaded}
                onChange={handleSupplierDecUpload}
              />
            </div>
            <div>
              <p className="font-mono text-xs text-[var(--muted2)] mb-2 font-bold uppercase tracking-wider">Statement of Origin</p>
              <p className="font-mono text-[10px] text-[var(--muted2)] mb-3">TCA Annex ORIG-4 — mandatory wording ≥95% match · EORI GB+12 · issue_date + 365 ≥ shipment_date</p>
              <UploadZone
                label="Upload Statement of Origin"
                fileName={origin.statementOfOriginFileName}
                uploaded={origin.statementOfOriginUploaded}
                onChange={handleStatementUpload}
              />
              {origin.statementOfOriginUploaded && (
                <div className="mt-2">
                  <label className="block font-mono text-[10px] text-[var(--muted2)] mb-1">Statement Issue Date (for validity check)</label>
                  <input
                    type="date"
                    value={origin.statementOfOriginIssueDate}
                    onChange={(e) => updateOrigin({ statementOfOriginIssueDate: e.target.value })}
                    className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  />
                  <p className="text-[10px] text-[var(--muted2)] mt-1">Valid for 12 months from issue date</p>
                </div>
              )}
            </div>
          </div>

          {/* Validity result */}
          {origin.statementOfOriginValid === false && (
            <div className="flex gap-3 bg-[rgba(255,83,112,0.06)] border border-[rgba(255,83,112,0.3)] rounded-lg p-4 mb-4">
              <AlertTriangle size={16} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
              <p className="font-mono text-xs text-[#ff5370]">
                <strong>Statement EXPIRED.</strong> Issue date + 365 days has passed. New statement required before preferential claim can be made. Shipment may still proceed at MFN rate.
              </p>
            </div>
          )}
          {origin.statementOfOriginValid === true && (
            <div className="flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4 mb-4">
              <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0 mt-0.5" />
              <p className="font-mono text-xs text-[var(--cyan)]">
                <strong>Document valid — Quick path.</strong> AI validation passed. Proceeding directly to TRQ gate. Skip wizard 3A–3F.
              </p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {(origin.supplierDeclarationUploaded || origin.statementOfOriginUploaded) && (
              <button
                onClick={handleValidateDocuments}
                className="flex items-center gap-2 px-4 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] transition-colors"
              >
                <Zap size={12} /> Validate Documents (AI)
              </button>
            )}
            <button
              onClick={handleUseWizard}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--muted2)] rounded-md font-mono text-xs hover:border-[var(--border2)] hover:text-[var(--text)] transition-colors"
            >
              No documents — use wizard below
            </button>
          </div>
        </Section>
      )}

      {/* ── GATES 3A–3F: RoO Wizard (shown only if wizard path) ── */}
      {origin.documentPath === 'wizard' && (
        <>
          {/* Gate 3A: Wholly Obtained */}
          <Section>
            <GateHeader num="3A" title="Gate 3A — Wholly Obtained" sub="TCA Art.ORIG.5 · Non-Preferential ORD Part One" />
            <div className="flex gap-2 items-start mb-5 bg-[rgba(0,0,0,0.2)] rounded-md p-3">
              <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-[var(--muted2)]">
                For alloy steel HS 7224, wholly obtained is rare — ferroalloys (Cr, Mo, V) are almost universally imported.
                Only applies if 100% UK-generated scrap and all ferroalloys UK-origin.
              </p>
            </div>
            <p className="font-mono text-xs text-[var(--muted2)] mb-4">
              Were ALL materials — including scrap and all ferroalloys — sourced entirely from the UK with zero imported content?
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[{ val: true, label: 'YES — Wholly Obtained' }, { val: false, label: 'NO — Has imported inputs' }].map(({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => updateOrigin({ whollyObtained: val })}
                  className={`p-3 rounded-lg border text-xs font-mono transition-all ${origin.whollyObtained === val ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {origin.whollyObtained === true && (
              <div className="mt-4 flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
                <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0" />
                <p className="font-mono text-xs text-[var(--cyan)]">Wholly Obtained → UK ORIGINATING → Skip to Gate 3E</p>
              </div>
            )}
          </Section>

          {/* Gate 3B: PSR / CTH / Melt+Pour */}
          {origin.whollyObtained === false && (
            <Section>
              <GateHeader num="3B" title="Gate 3B — PSR: CTH Rule + Melt & Pour" sub="TCA Annex ORIG-2 · CTH (Change of Tariff Heading) · TCA Art.ORIG.19" />
              <div className="flex gap-2 items-start mb-5 bg-[rgba(0,0,0,0.2)] rounded-md p-3">
                <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
                <p className="font-mono text-[10px] text-[var(--muted2)]">
                  For HS 7224: CTH rule requires all non-originating materials to be classified under a different 4-digit heading.
                  MELT AND POUR rule (TCA Art.ORIG.19): both melt AND pour must occur in UK.
                  Scrap (7204), Ferro-Cr (7202), Ferro-Mo (7202) — all satisfy CTH for 7224.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">Country of Melt (ISO 2)</label>
                  <input
                    type="text" maxLength={2}
                    value={origin.meltCountry}
                    onChange={(e) => updateOrigin({ meltCountry: e.target.value.toUpperCase() })}
                    className={`w-full bg-[var(--s3)] border rounded-md px-3 py-2 text-sm font-mono focus:outline-none uppercase ${origin.meltCountry.toUpperCase() === 'RU' ? 'border-[#ff5370] text-[#ff5370] focus:border-[#ff5370]' : 'border-[var(--border)] text-[var(--text)] focus:border-[var(--cyan)]'}`}
                    placeholder="GB"
                  />
                  {origin.meltCountry.toUpperCase() === 'RU' && (
                    <p className="text-[10px] text-[#ff5370] mt-1">⚠ RU melt → HARD BLOCK</p>
                  )}
                  {origin.meltCountry.toUpperCase() !== 'RU' && origin.meltCountry.toUpperCase() !== 'GB' && origin.meltCountry && (
                    <p className="text-[10px] text-[#ffd166] mt-1">Non-UK melt — check cumulation (Gate 3C)</p>
                  )}
                </div>
                <div>
                  <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">Country of Pour / Cast (ISO 2)</label>
                  <input
                    type="text" maxLength={2}
                    value={origin.pourCountry}
                    onChange={(e) => updateOrigin({ pourCountry: e.target.value.toUpperCase() })}
                    className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none uppercase"
                    placeholder="GB"
                  />
                  <p className="text-[10px] text-[var(--muted2)] mt-1">Melt=GB + Pour=GB → satisfies Art.ORIG.19</p>
                </div>
              </div>

              {/* Gate 3D: Sufficient Processing (inline here before determining 3B result) */}
              <div className="mb-5">
                <label className="block font-mono text-xs text-[var(--muted2)] mb-3 uppercase tracking-wider">
                  Gate 3D — Operations performed in UK
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SUFFICIENT_OPS.map((op) => {
                    const selected = origin.sufficientOps.includes(op.id);
                    return (
                      <button
                        key={op.id}
                        onClick={() => {
                          const next = selected
                            ? origin.sufficientOps.filter(id => id !== op.id)
                            : [...origin.sufficientOps, op.id];
                          updateOrigin({ sufficientOps: next });
                        }}
                        className={`flex items-center gap-2 p-3 rounded-md border text-left text-xs transition-all ${selected ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)]' : 'border-[var(--border)] hover:border-[var(--border2)]'}`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-[var(--cyan)] bg-[var(--cyan)]' : 'border-[var(--border2)]'}`}>
                          {selected && <span className="text-black text-[8px] font-bold">✓</span>}
                        </span>
                        <span className={op.sufficient ? 'text-[var(--text)]' : 'text-[var(--muted2)]'}>
                          {op.label}
                          {!op.sufficient && <span className="ml-1 text-[#ff5370] text-[9px]">(insufficient)</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleDeriveOrigin3B}
                disabled={!origin.meltCountry || !origin.pourCountry}
                className="px-4 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Evaluate CTH + Melt/Pour
              </button>

              {origin.cthSatisfied === true && (
                <div className="mt-3 flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
                  <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0" />
                  <p className="font-mono text-xs text-[var(--cyan)]">CTH satisfied + Melt/Pour rule met → Proceed to Gate 3E</p>
                </div>
              )}
              {origin.cthSatisfied === false && origin.originResult !== 'NOT_ORIGINATING' && (
                <div className="mt-3 flex gap-3 bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.3)] rounded-lg p-4">
                  <AlertTriangle size={16} className="text-[#ffd166] flex-shrink-0" />
                  <p className="font-mono text-xs text-[#ffd166]">CTH check inconclusive — check Gate 3C (Cumulation) or Gate 3E result.</p>
                </div>
              )}
            </Section>
          )}

          {/* Gate 3C: Cumulation */}
          {origin.whollyObtained === false && origin.cthSatisfied === false && (
            <Section highlight="amber">
              <GateHeader num="3C" title="Gate 3C — Cumulation" sub="TCA Art.ORIG.3 — EU-origin materials treated as UK-origin" />
              <p className="font-mono text-xs text-[var(--muted2)] mb-4">
                If EU ferroalloys used → bilateral cumulation → EU-origin materials count as UK-origin → CTH may be satisfied.
                Statement must say &ldquo;Cumulation applied with EU&rdquo; NOT &ldquo;No cumulation applied&rdquo;.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => updateOrigin({ euInputsPresent: true })}
                  className={`px-4 py-2 rounded-lg border text-xs font-mono transition-all ${origin.euInputsPresent === true ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'}`}
                >YES — EU inputs present</button>
                <button
                  onClick={() => updateOrigin({ euInputsPresent: false })}
                  className={`px-4 py-2 rounded-lg border text-xs font-mono transition-all ${origin.euInputsPresent === false ? 'border-[#ff5370] bg-[rgba(255,83,112,0.06)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted2)] hover:border-[var(--border2)]'}`}
                >NO — No EU inputs</button>
              </div>
              {origin.euInputsPresent && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateOrigin({ cumulationApplied: !origin.cumulationApplied })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${origin.cumulationApplied ? 'bg-[var(--cyan)]' : 'bg-[var(--s3)]'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${origin.cumulationApplied ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="font-mono text-xs text-[var(--text)]">Apply EU Bilateral Cumulation (obtain EU supplier declarations)</span>
                </div>
              )}
            </Section>
          )}

          {/* Gate 3E: Origin Result */}
          {(origin.whollyObtained !== null || origin.cthSatisfied !== null) && origin.documentPath === 'wizard' && (
            <Section highlight={origin.originResult === 'UK_ORIGINATING' ? 'cyan' : origin.originResult === 'NOT_ORIGINATING' ? 'red' : undefined}>
              <GateHeader num="3E" title="Gate 3E — Origin Result" />
              {!origin.originResult && (
                <button
                  onClick={handleDetermineOrigin}
                  className="px-5 py-2.5 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-lg font-mono text-xs font-bold hover:bg-[rgba(100,255,218,0.2)] transition-colors"
                >
                  Determine Origin
                </button>
              )}
              {origin.originResult === 'UK_ORIGINATING' && (
                <div className="flex gap-3 bg-[rgba(100,255,218,0.06)] border border-[rgba(100,255,218,0.2)] rounded-lg p-5">
                  <CheckCircle size={20} className="text-[var(--cyan)] flex-shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-bold text-[var(--cyan)]">UK ORIGINATING</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">{origin.originBasis}</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">→ Proceed to Gate 3F (Document Generation) → TRQ Gate</p>
                  </div>
                </div>
              )}
              {origin.originResult === 'NOT_ORIGINATING' && (
                <div className="flex gap-3 bg-[rgba(255,83,112,0.06)] border border-[rgba(255,83,112,0.3)] rounded-lg p-5">
                  <XCircle size={20} className="text-[#ff5370] flex-shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-bold text-[#ff5370]">NOT ORIGINATING</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">{origin.originBasis}</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">→ Non-preferential rules apply (Gate 5 below). MFN rate applies.</p>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Gate 3F: Document Generation */}
          {origin.originResult === 'UK_ORIGINATING' && (
            <Section highlight="cyan">
              <GateHeader num="3F" title="Gate 3F — Statement of Origin Generation" sub="TCA Annex ORIG-4 — If no statement was uploaded in Gate 2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {needsEORI && (
                  <div className="md:col-span-2">
                    <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
                      UK Exporter EORI (GB + 12 digits) — required &gt;€6,000
                    </label>
                    <input
                      type="text"
                      value={origin.eoriNumber}
                      onChange={(e) => updateOrigin({ eoriNumber: e.target.value })}
                      className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                      placeholder="GB123456789012"
                    />
                    {origin.eoriNumber && !/^GB\d{12}$/.test(origin.eoriNumber) && (
                      <p className="text-[10px] text-[#ff5370] mt-1">Format: GB + 12 digits</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block font-mono text-xs text-[var(--muted2)] mb-2">Cumulation Statement</label>
                  <select
                    value={origin.cumulationStatement}
                    onChange={(e) => updateOrigin({ cumulationStatement: e.target.value })}
                    className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                  >
                    <option value="">Select…</option>
                    <option value="No cumulation applied">No cumulation applied</option>
                    <option value="Cumulation applied with EU">Cumulation applied with EU</option>
                  </select>
                </div>
              </div>

              {origin.statementOnOriginGenerated ? (
                <div>
                  <pre className="p-4 bg-[var(--s3)] border border-[rgba(100,255,218,0.2)] rounded-lg text-xs font-mono text-[var(--text)] whitespace-pre-wrap mb-3">
                    {origin.statementOnOriginText}
                  </pre>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--cyan)] text-black rounded-lg font-mono text-xs font-bold hover:opacity-90 transition-opacity">
                      <FileText size={12} /> Download PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-[var(--cyan)] text-[var(--cyan)] rounded-lg font-mono text-xs hover:bg-[rgba(100,255,218,0.08)] transition-colors">
                      <Shield size={12} /> Add to Barrister&apos;s Bundle
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-[var(--muted2)] mt-2">SHA-256 hash stored in audit log. User must sign before finalising.</p>
                </div>
              ) : (
                <button
                  onClick={handleGenerateStatement}
                  disabled={!!needsEORI && !origin.eoriNumber}
                  className="px-5 py-2.5 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-lg font-mono text-xs font-bold hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Statement of Origin
                </button>
              )}
            </Section>
          )}

          {/* Gate 5: Non-Preferential */}
          {showGate5 && (
            <Section highlight="red">
              <GateHeader num="5" title="Gate 5 — Non-Preferential Regime" sub="Goods do not qualify for UK preferential origin" />
              <p className="font-mono text-xs text-[var(--muted2)] mb-4">
                MFN rate applies. The following measures may apply — fetch live TARIC at shipment date.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'EU MFN Customs Duty', status: 'Verify', note: '0% for HS 7224 UK-origin — check TARIC' },
                  { label: 'Anti-Dumping (ADD)', status: 'Verify', note: 'No active ADD on UK-origin 7224 — verify at shipment date' },
                  { label: 'Countervailing Duties (CVD)', status: 'Verify', note: 'No active CVD on UK-origin 7224 — verify' },
                  { label: 'Trade Embargo', status: 'BLOCKED if RU', note: 'Russia: full embargo. Belarus: restrictions.' },
                  { label: 'Prior Surveillance (V710)', status: 'Verify', note: 'If V710 present → EU importer must obtain surveillance doc' },
                  { label: 'Safeguard TRQ Cat.26', status: 'MANDATORY', note: 'Runs regardless of origin status → TRQ gate below' },
                ].map(({ label, status, note }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-[var(--s3)] rounded-lg border border-[var(--border)]">
                    <AlertTriangle size={12} className="text-[#ffd166] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-xs font-bold text-[var(--text)]">{label}</p>
                      <p className="font-mono text-[9px] text-[#ffd166] mt-0.5">{status}</p>
                      <p className="font-mono text-[9px] text-[var(--muted2)] mt-0.5">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {/* ── TRQ LIVE SCREEN ── (always shown once origin is determined or quick path) */}
      {(showTRQ || showGate5) && (
        <Section highlight="cyan">
          <GateHeader
            num="TRQ"
            title="TRQ Live Screening — Steel Safeguard"
            sub="EU Reg 2019/159 + Implementing Reg (EU) 2025/612 · UK TRA Notice 2025/12 · Category 26 — Other Alloy Steel Semi-finished"
          />

          <div className="flex gap-2 items-start mb-5 bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.2)] rounded-md p-3">
            <AlertTriangle size={12} className="text-[#ffd166] flex-shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-[#ffd166]">
              NEW EU REGIME: COM(2025)726 expected Jul 2026 — quota volume -47%, out-of-quota duty 25%→50%, melt+pour evidence mandatory from 1 Oct 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">TRQ Category</label>
              <input
                type="text"
                value={origin.trqCategoryCode}
                onChange={(e) => updateOrigin({ trqCategoryCode: e.target.value })}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="26"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-4 flex-wrap">
            <button
              onClick={handleFetchTRQ}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] transition-colors"
            >
              <Zap size={12} /> Fetch Live TRQ Balance
            </button>
            {!origin.trqStatus && (
              <p className="font-mono text-[10px] text-[var(--muted2)] self-center">
                Real: EU TARIC quota balance API · HMRC CDS API · Cached 6h
              </p>
            )}
          </div>

          {origin.trqStatus && (
            <div className={`flex gap-3 rounded-lg p-4 border ${
              origin.trqStatus === 'in_quota' ? 'bg-[rgba(100,255,218,0.05)] border-[rgba(100,255,218,0.2)]' :
              origin.trqStatus === 'amber' ? 'bg-[rgba(255,209,102,0.05)] border-[rgba(255,209,102,0.3)]' :
              'bg-[rgba(255,83,112,0.06)] border-[rgba(255,83,112,0.3)]'
            }`}>
              {origin.trqStatus === 'in_quota' ? <CheckCircle size={18} className="text-[var(--cyan)] flex-shrink-0" /> :
               origin.trqStatus === 'amber' ? <AlertTriangle size={18} className="text-[#ffd166] flex-shrink-0" /> :
               <XCircle size={18} className="text-[#ff5370] flex-shrink-0" />}
              <div>
                {origin.trqStatus === 'in_quota' && (
                  <>
                    <p className="font-mono text-sm font-bold text-[var(--cyan)]">TRQ IN QUOTA — 0% Safeguard Duty</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">Quota remaining: {origin.trqPercentRemaining}% · Category 26 available</p>
                  </>
                )}
                {origin.trqStatus === 'amber' && (
                  <>
                    <p className="font-mono text-sm font-bold text-[#ffd166]">WARNING: Quota at {origin.trqPercentRemaining}% — Alert threshold reached</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">Estimated depletion based on 4-week average burn rate. Monitor daily.</p>
                  </>
                )}
                {origin.trqStatus === 'exhausted' && (
                  <>
                    <p className="font-mono text-sm font-bold text-[#ff5370]">TRQ EXHAUSTED — Out-of-quota duty: 25% (current) / 50% (Jul 2026+)</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">Options: (1) Wait for next quarter, (2) Re-route via different category/origin, (3) Proceed and absorb duty.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Manual override for demo */}
          {origin.trqStatus && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {(['in_quota', 'amber', 'exhausted'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateOrigin({ trqStatus: s, trqPercentRemaining: s === 'in_quota' ? 43 : s === 'amber' ? 18 : 0 })}
                  className={`px-3 py-1 rounded font-mono text-[10px] border transition-colors ${origin.trqStatus === s ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-[var(--border)] text-[var(--muted2)]'}`}
                >
                  {s}
                </button>
              ))}
              <span className="font-mono text-[10px] text-[var(--muted2)] self-center">(demo override)</span>
            </div>
          )}
        </Section>
      )}

      {/* ── SECTION 301 (US Corridor) ── */}
      {(showTRQ || showGate5) && (
        <Section>
          <GateHeader num="S301" title="Section 301 Tariff Engine" sub="US-China corridor only · Trade Act 1974 §301 · Lists 1-4A · 178 exclusions to 10 Nov 2026" />
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => updateOrigin({ usCorridorApplicable: !origin.usCorridorApplicable })}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${origin.usCorridorApplicable ? 'bg-[var(--cyan)]' : 'bg-[var(--s3)]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${origin.usCorridorApplicable ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="font-mono text-xs text-[var(--text)]">This is a US-China shipment corridor</span>
          </div>
          {origin.usCorridorApplicable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { list: 'List 1', rate: '25%', note: '$34B · Jul 2018' },
                  { list: 'List 2', rate: '25%', note: '$16B · Aug 2018' },
                  { list: 'List 3', rate: '25%', note: '$200B · May 2019' },
                  { list: 'List 4A', rate: '7.5%', note: '$120B · Jan 2020' },
                ].map((l) => (
                  <button
                    key={l.list}
                    onClick={() => updateOrigin({ section301ListHit: l.list, section301Surcharge: parseFloat(l.rate) })}
                    className={`p-3 rounded-lg border text-left text-xs transition-all ${origin.section301ListHit === l.list ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.08)]' : 'border-[var(--border)] hover:border-[var(--border2)]'}`}
                  >
                    <p className="font-mono font-bold text-[var(--text)]">{l.list}</p>
                    <p className="font-mono text-[var(--cyan)]">{l.rate} surcharge</p>
                    <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">{l.note}</p>
                  </button>
                ))}
              </div>
              {origin.section301ListHit && (
                <div className="flex gap-3 bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.2)] rounded-lg p-4">
                  <AlertTriangle size={16} className="text-[#ffd166] flex-shrink-0" />
                  <div>
                    <p className="font-mono text-xs font-bold text-[#ffd166]">S.301 {origin.section301ListHit} — +{origin.section301Surcharge}% surcharge applies</p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                      Total US duty = Base HTSUS rate + S.301 surcharge + Section 232 steel (25% if applicable).
                    </p>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                      <strong>Exclusion checker:</strong> 178 products extended to 10 Nov 2026 under HTSUS 9903.88.69 / 9903.88.70.
                      Filing instruction: add exclusion code to entry summary per CBP CSMS #64018403.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {!origin.usCorridorApplicable && (
            <p className="font-mono text-xs text-[var(--muted2)]">Not applicable — enable if US import with Chinese origin content.</p>
          )}
        </Section>
      )}

      {/* ── UFLPA ── */}
      {origin.usCorridorApplicable && (showTRQ || showGate5) && (
        <Section highlight="red">
          <GateHeader num="UFLPA" title="UFLPA — Clean Supply Chain Audit" sub="Uyghur Forced Labor Prevention Act · Effective Jun 2022 · Rebuttable Presumption" />
          <div className="flex gap-2 items-start mb-5 bg-[rgba(255,83,112,0.05)] border border-[rgba(255,83,112,0.25)] rounded-md p-3">
            <AlertOctagon size={12} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-[#ff5370]">
              All goods mined/produced/manufactured wholly or in part in Xinjiang are PRESUMED to violate 19 U.S.C. 1307.
              Importer must prove by clear and convincing evidence. $4B in goods detained since inception.
            </p>
          </div>
          <div className="mb-4">
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">Factory Region / Province</label>
            <input
              type="text"
              value={origin.uflpaFactoryRegion}
              onChange={(e) => {
                const v = e.target.value;
                const xinjiang = /xinjiang|新疆|qinghai|gansu|inner mongolia/i.test(v);
                updateOrigin({ uflpaFactoryRegion: v, uflpaRiskLevel: v ? (xinjiang ? 'HARD_BLOCK' : 'CLEAR') : null });
              }}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              placeholder="e.g. Shanghai, Xinjiang, Qinghai…"
            />
          </div>
          {origin.uflpaRiskLevel === 'HARD_BLOCK' && (
            <div className="flex gap-3 bg-[rgba(255,83,112,0.08)] border border-[rgba(255,83,112,0.4)] rounded-lg p-4">
              <XCircle size={16} className="text-[#ff5370] flex-shrink-0" />
              <div>
                <p className="font-mono text-sm font-bold text-[#ff5370]">UFLPA RISK — Sub-tier COO mapping required</p>
                <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                  For steel HS 7224: require (1) Iron ore/scrap origin COO, (2) Ferroalloy origin COO, (3) EAF facility confirmation.
                  All must show non-Xinjiang origin. Submit UFLPA evidence package to CBP before departure.
                </p>
              </div>
            </div>
          )}
          {origin.uflpaRiskLevel === 'CLEAR' && (
            <div className="flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
              <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0" />
              <p className="font-mono text-xs text-[var(--cyan)]">Factory region not flagged as high-risk. Proceed.</p>
            </div>
          )}
        </Section>
      )}

      {/* ── CSL / ENTITY LIST SCREENING ── */}
      {(showTRQ || showGate5) && (
        <Section highlight={origin.cslScreeningStatus === 'HARD_BLOCK' ? 'red' : origin.cslScreeningStatus === 'AMBER' ? 'amber' : undefined}>
          <GateHeader num="CSL" title="Entity List & CSL Screening" sub="ITA Consolidated Screening List · BIS Entity List · OFAC SDN · UN · OFSI · EU Consolidated · UFLPA Entity List" />
          <div className="flex gap-2 items-start mb-5 bg-[rgba(0,0,0,0.2)] rounded-md p-3">
            <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-[var(--muted2)]">
              ITA CSL API at api.trade.gov/consolidated_screening_list — 11 export screening lists, updated hourly.
              Score ≥95% = HARD BLOCK · 80–94% = AMBER (human review) · &lt;80% = PASS.
              BIS Entity List: 1,800+ Chinese entities as of March 2026. Penalty: up to $1.3M per violation.
            </p>
          </div>

          <div className="mb-4">
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">Entity / Party Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={origin.cslPartyName}
                onChange={(e) => updateOrigin({ cslPartyName: e.target.value })}
                className="flex-1 bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="Supplier, buyer, or end-user name"
              />
              <button
                onClick={handleScreenCSL}
                disabled={!origin.cslPartyName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Search size={12} /> Screen
              </button>
            </div>
          </div>

          {/* Demo override buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['PASS', 'AMBER', 'HARD_BLOCK'] as const).map((s) => (
              <button
                key={s}
                onClick={() => updateOrigin({
                  cslScreeningStatus: s,
                  cslMatchedEntity: s !== 'PASS' ? origin.cslPartyName : null,
                  cslConfidenceScore: s === 'HARD_BLOCK' ? 96 : s === 'AMBER' ? 85 : 40,
                })}
                className={`px-3 py-1 rounded font-mono text-[10px] border transition-colors ${origin.cslScreeningStatus === s ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-[var(--border)] text-[var(--muted2)]'}`}
              >
                {s}
              </button>
            ))}
            <span className="font-mono text-[10px] text-[var(--muted2)] self-center">(demo override)</span>
          </div>

          {origin.cslScreeningStatus === 'PASS' && (
            <div className="flex gap-3 bg-[rgba(100,255,218,0.05)] border border-[rgba(100,255,218,0.2)] rounded-lg p-4">
              <CheckCircle size={16} className="text-[var(--cyan)] flex-shrink-0" />
              <div>
                <p className="font-mono text-xs font-bold text-[var(--cyan)]">CLEARED — No entity list match (score: {origin.cslConfidenceScore}%)</p>
                <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">Screened against 11 CSL lists. Result logged in audit trail.</p>
              </div>
            </div>
          )}
          {origin.cslScreeningStatus === 'AMBER' && (
            <div className="flex gap-3 bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.3)] rounded-lg p-4">
              <AlertTriangle size={16} className="text-[#ffd166] flex-shrink-0" />
              <div>
                <p className="font-mono text-xs font-bold text-[#ffd166]">AMBER FLAG — Score {origin.cslConfidenceScore}% — Human review required</p>
                <p className="font-mono text-xs text-[var(--muted2)] mt-1">Possible match: {origin.cslMatchedEntity}. Do not proceed without compliance officer clearance.</p>
              </div>
            </div>
          )}
          {origin.cslScreeningStatus === 'HARD_BLOCK' && (
            <div className="flex gap-3 bg-[rgba(255,83,112,0.08)] border border-[rgba(255,83,112,0.4)] rounded-lg p-4">
              <XCircle size={18} className="text-[#ff5370] flex-shrink-0" />
              <div>
                <p className="font-mono text-sm font-bold text-[#ff5370]">ENTITY LIST MATCH — HARD BLOCK</p>
                <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                  {origin.cslMatchedEntity} appears on a controlled entity list (score: {origin.cslConfidenceScore}%).
                  Shipment creation blocked. Contact your trade compliance officer immediately.
                </p>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Reg ref */}
      <div className="flex gap-2 items-start p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
        <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-[var(--muted2)]">
          Reg ref: TCA Annex ORIG-2/3/4 · Non-Preferential ORD March 2023 · EU Reg 2019/159 + COM(2025)726 ·
          HMRC TRA Notice 2025/12 · ITA CSL API (api.trade.gov) · USTR Section 301 · UFLPA (Jun 2022) ·
          BIS Entity List · OFAC SDN · UK OFSI · EU Consolidated List · UN Consolidated List
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--muted2)] rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:border-[var(--border2)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] text-black rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Continue to Sanctions <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
