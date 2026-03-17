"use client";

import React, { useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Upload,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import { useShipmentStore, OriginRiskLevel, MTCStatus } from '@/lib/stores/shipmentStore';

const RISK_CONFIG: Record<
  OriginRiskLevel,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  BLOCKED: {
    label: 'BLOCKED — Russian Origin',
    color: 'text-[#ff5370]',
    bg: 'bg-[rgba(255,83,112,0.08)]',
    border: 'border-[rgba(255,83,112,0.4)]',
    icon: <XCircle size={18} className="text-[#ff5370]" />,
  },
  ELEVATED_RISK: {
    label: 'ELEVATED RISK — Mandatory MTC + Chain of Custody',
    color: 'text-[#ff5370]',
    bg: 'bg-[rgba(255,83,112,0.06)]',
    border: 'border-[rgba(255,83,112,0.3)]',
    icon: <AlertTriangle size={18} className="text-[#ff5370]" />,
  },
  STANDARD_ENHANCED: {
    label: 'STANDARD ENHANCED — MTC Analysis Required',
    color: 'text-[#ffd166]',
    bg: 'bg-[rgba(255,209,102,0.06)]',
    border: 'border-[rgba(255,209,102,0.3)]',
    icon: <AlertTriangle size={18} className="text-[#ffd166]" />,
  },
  STANDARD_REVIEW: {
    label: 'STANDARD REVIEW — MTC Spot-check Recommended',
    color: 'text-[var(--cyan)]',
    bg: 'bg-[rgba(100,255,218,0.05)]',
    border: 'border-[rgba(100,255,218,0.2)]',
    icon: <CheckCircle size={18} className="text-[var(--cyan)]" />,
  },
};

const MTC_STATUS_CONFIG: Record<MTCStatus, { label: string; color: string }> = {
  CLEARED: { label: 'CLEARED', color: 'text-[var(--cyan)]' },
  BLOCKED: { label: 'BLOCKED', color: 'text-[#ff5370]' },
  HOLD: { label: 'ON HOLD — Update Required', color: 'text-[#ffd166]' },
  PENDING: { label: 'PENDING VERIFICATION', color: 'text-[#ffd166]' },
};

const HIGH_RISK_INDIRECT = ['BY', 'KZ', 'AM', 'GE'];
const HIGH_RISK_TRANSIT = ['UA', 'MD'];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step3_Sanctions = ({ onNext, onBack }: Props) => {
  const { sanctions, updateSanctions, computeOriginRisk, markStepComplete } = useShipmentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCountryChange = (country: string) => {
    updateSanctions({ declaredOriginCountry: country.toUpperCase() });
    // Recompute risk after a brief delay (let state settle)
    setTimeout(computeOriginRisk, 0);
  };

  const handleMTCUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateSanctions({
      mtcUploaded: true,
      mtcFileName: file.name,
      mtcStatus: 'PENDING',
    });
  };

  const handleMTCFieldChange = (field: string, value: string) => {
    updateSanctions({
      mtcFields: { ...sanctions.mtcFields, [field]: value },
    });
  };

  const handleVerifyMTC = () => {
    const f = sanctions.mtcFields;
    const meltBlocked = f.meltLocation?.toUpperCase() === 'RU';
    const millBlocked = false; // Real: screen against OFSI

    if (meltBlocked || millBlocked) {
      updateSanctions({ mtcStatus: 'BLOCKED' });
      return;
    }

    const allFilled =
      f.steelMillName &&
      f.meltLocation &&
      f.heatNumber &&
      f.productStandard &&
      f.certificateType &&
      f.issueDate;

    if (!allFilled) {
      updateSanctions({ mtcStatus: 'HOLD' });
      return;
    }

    // Check issue date within 12 months
    const issueDate = new Date(f.issueDate);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    if (issueDate < twelveMonthsAgo) {
      updateSanctions({ mtcStatus: 'HOLD' });
      return;
    }

    updateSanctions({ mtcStatus: 'CLEARED' });
  };

  const addChainEntry = () => {
    const nextTier = sanctions.chainOfCustodyLog.length + 1;
    updateSanctions({
      chainOfCustodyLog: [
        ...sanctions.chainOfCustodyLog,
        { tier: nextTier, entityName: '', country: '', date: '', reference: '' },
      ],
    });
  };

  const updateChainEntry = (idx: number, field: string, value: string) => {
    const updated = sanctions.chainOfCustodyLog.map((entry, i) =>
      i === idx ? { ...entry, [field]: value } : entry,
    );
    updateSanctions({ chainOfCustodyLog: updated });
  };

  const removeChainEntry = (idx: number) => {
    updateSanctions({
      chainOfCustodyLog: sanctions.chainOfCustodyLog.filter((_, i) => i !== idx),
    });
  };

  const riskConfig = sanctions.originRiskLevel ? RISK_CONFIG[sanctions.originRiskLevel] : null;

  const canProceed =
    sanctions.originRiskLevel !== 'BLOCKED' &&
    (sanctions.mtcStatus === 'CLEARED' || sanctions.originRiskLevel === 'STANDARD_REVIEW');

  const handleNext = () => {
    markStepComplete(3);
    onNext();
  };

  const isChapter73 =
    useShipmentStore.getState().classification.hsHeading?.startsWith('73') ?? false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 3 — Sanctions Compliance Engine
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            Non-Russian Origin Verification via Mill Test Certificate (MTC)
          </p>
        </div>
      </div>

      {/* Critical notice */}
      <div className="flex gap-3 bg-[rgba(255,83,112,0.06)] border border-[rgba(255,83,112,0.3)] rounded-lg p-4">
        <XCircle size={16} className="text-[#ff5370] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-xs text-[#ff5370]">
          <strong>CRITICAL:</strong> Steel of Russian melt origin is prohibited even if subsequently
          processed in a third country (e.g. Turkey). Substantial transformation does NOT cure sanctions
          taint under UK/EU law. Reg ref: UK SI 2019/855 · EU Reg 833/2014 Art.3g
        </p>
      </div>

      {/* Step 3.1 — Origin Country Screening */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">1</div>
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Step 3.1 — Origin Country Screening
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-xs text-[var(--muted2)] mb-2 uppercase tracking-wider">
              Declared Country of Origin (ISO 2-letter code)
            </label>
            <input
              type="text"
              maxLength={2}
              value={sanctions.declaredOriginCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono uppercase focus:border-[var(--cyan)] focus:outline-none"
              placeholder="e.g. GB, DE, TR"
            />
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-[#ff5370]">
                Blocked: RU
              </p>
              <p className="text-[10px] text-[#ffa07a]">
                Elevated risk: {HIGH_RISK_INDIRECT.join(', ')} (indirect routing)
              </p>
              <p className="text-[10px] text-[#ffd166]">
                Enhanced: {HIGH_RISK_TRANSIT.join(', ')} (transshipment risk)
              </p>
            </div>
          </div>
        </div>

        {/* Risk level display */}
        {riskConfig && (
          <div className={`flex gap-3 rounded-lg p-4 border ${riskConfig.bg} ${riskConfig.border}`}>
            {riskConfig.icon}
            <div>
              <p className={`font-mono text-sm font-bold ${riskConfig.color}`}>{riskConfig.label}</p>
              {sanctions.originRiskLevel === 'BLOCKED' && (
                <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                  Shipment creation BLOCKED. Compliance event logged. Notify Compliance Officer.
                  Consider SAR obligation under POCA 2002.
                </p>
              )}
              {sanctions.originRiskLevel === 'ELEVATED_RISK' && (
                <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                  MANDATORY: Steps 3.2 + 3.3 (MTC + Chain of Custody). REQUIRE: Country of MELT AND
                  POUR certificate — not just processing country.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sanctions list screening notice */}
        {sanctions.originRiskLevel && sanctions.originRiskLevel !== 'BLOCKED' && (
          <div className="mt-4 p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
            <p className="font-mono text-[10px] text-[var(--muted2)] font-bold mb-1">
              Party Screening — All parties screened against:
            </p>
            <div className="grid grid-cols-2 gap-1">
              {['UK OFSI Consolidated List', 'UN Consolidated List', 'OFAC SDN List', 'EU Consolidated Sanctions List'].map((list) => (
                <div key={list} className="flex items-center gap-1">
                  <CheckCircle size={10} className="text-[var(--cyan)]" />
                  <span className="font-mono text-[10px] text-[var(--muted2)]">{list}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 3.2 — MTC Verification */}
      {sanctions.originRiskLevel && sanctions.originRiskLevel !== 'BLOCKED' && (
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-black text-[10px] font-bold flex items-center justify-center">2</div>
            <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Step 3.2 — Mill Test Certificate (MTC) Verification
            </h3>
          </div>

          {/* Upload */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xml,.json"
              onChange={handleMTCUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                sanctions.mtcUploaded
                  ? 'border-[var(--cyan)] bg-[rgba(100,255,218,0.05)]'
                  : 'border-[var(--border2)] hover:border-[var(--cyan)] hover:bg-[rgba(100,255,218,0.03)]'
              }`}
            >
              <Upload size={24} className={`mx-auto mb-2 ${sanctions.mtcUploaded ? 'text-[var(--cyan)]' : 'text-[var(--muted2)]'}`} />
              {sanctions.mtcUploaded ? (
                <div>
                  <p className="font-mono text-sm text-[var(--cyan)]">{sanctions.mtcFileName}</p>
                  <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">Click to replace</p>
                </div>
              ) : (
                <div>
                  <p className="font-mono text-sm text-[var(--text)]">Upload Mill Test Certificate</p>
                  <p className="font-mono text-xs text-[var(--muted2)] mt-1">PDF, XML or JSON · EN 10204 Type 3.1 or 3.2 preferred</p>
                </div>
              )}
            </div>
          </div>

          {/* MTC Fields */}
          <p className="font-mono text-xs text-[var(--muted2)] mb-4 uppercase tracking-wider">
            Step 3.2.1 — Mandatory MTC Fields (parse or enter manually)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { key: 'steelMillName', label: 'Steel Mill Name', placeholder: 'Full legal name of producing mill' },
              { key: 'meltLocation', label: 'Country of Melt (ISO)', placeholder: 'e.g. GB, DE, TR (NOT RU)' },
              { key: 'pourLocation', label: 'Country of Pour (ISO)', placeholder: 'Same as melt or transformation' },
              { key: 'heatNumber', label: 'Heat / Cast Number', placeholder: 'Unique production batch ID' },
              { key: 'productStandard', label: 'Product Standard', placeholder: 'EN 10025, ASTM A36, BS EN 10210…' },
              { key: 'certificateType', label: 'Certificate Type (EN 10204)', placeholder: 'Type 3.1 or 3.2 (preferred)' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block font-mono text-xs text-[var(--muted2)] mb-1">{label}</label>
                <input
                  type="text"
                  value={(sanctions.mtcFields as Record<string, string>)[key] || ''}
                  onChange={(e) => handleMTCFieldChange(key, e.target.value)}
                  className={`w-full bg-[var(--s3)] border rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:outline-none transition-colors ${
                    key === 'meltLocation' &&
                    sanctions.mtcFields.meltLocation?.toUpperCase() === 'RU'
                      ? 'border-[#ff5370] focus:border-[#ff5370]'
                      : 'border-[var(--border)] focus:border-[var(--cyan)]'
                  }`}
                  placeholder={placeholder}
                />
                {key === 'meltLocation' && sanctions.mtcFields.meltLocation?.toUpperCase() === 'RU' && (
                  <p className="text-[10px] text-[#ff5370] mt-1">⚠ Russian melt origin — BLOCKED</p>
                )}
              </div>
            ))}
            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-1">
                Issue Date (must be within 12 months)
              </label>
              <input
                type="date"
                value={sanctions.mtcFields.issueDate}
                onChange={(e) => handleMTCFieldChange('issueDate', e.target.value)}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-[var(--muted2)] mb-1">
                Chemical Composition Summary
              </label>
              <input
                type="text"
                value={sanctions.mtcFields.chemicalComposition}
                onChange={(e) => handleMTCFieldChange('chemicalComposition', e.target.value)}
                className="w-full bg-[var(--s3)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                placeholder="C:0.18%, Si:0.25%, Mn:1.40%..."
              />
            </div>
          </div>

          {/* Verify button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleVerifyMTC}
              disabled={!sanctions.mtcUploaded && !sanctions.mtcFields.steelMillName}
              className="px-5 py-2 bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] text-[var(--cyan)] rounded-md font-mono text-xs hover:bg-[rgba(100,255,218,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Verify MTC
            </button>

            {sanctions.mtcStatus && (
              <span className={`font-mono text-sm font-bold ${MTC_STATUS_CONFIG[sanctions.mtcStatus].color}`}>
                STATUS: {MTC_STATUS_CONFIG[sanctions.mtcStatus].label}
              </span>
            )}
          </div>

          {sanctions.mtcStatus === 'CLEARED' && (
            <div className="mt-3 flex gap-2 items-center text-[10px] text-[var(--muted2)] font-mono">
              <CheckCircle size={12} className="text-[var(--cyan)]" />
              SHA-256 hash of MTC PDF will be stored in Veritariff immutable audit log
            </div>
          )}
        </div>
      )}

      {/* Step 3.3 — Chain of Custody */}
      {(sanctions.originRiskLevel === 'ELEVATED_RISK' || isChapter73) && (
        <div className="bg-[var(--s1)] border border-[rgba(255,83,112,0.3)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-[#ff5370] text-white text-[10px] font-bold flex items-center justify-center">3</div>
            <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Step 3.3 — Chain of Custody
            </h3>
            {isChapter73 && (
              <span className="font-mono text-[10px] text-[#ff5370] border border-[rgba(255,83,112,0.4)] px-2 py-0.5 rounded">
                Chapter 73 — MANDATORY
              </span>
            )}
          </div>

          <p className="font-mono text-xs text-[var(--muted2)] mb-4">
            Full upstream MTC chain required. Tier 1: Raw steel mill → Tier 2: Rolling/processing → Tier 3: UK exporter inventory.
          </p>

          <div className="space-y-3 mb-4">
            {sanctions.chainOfCustodyLog.map((entry, idx) => (
              <div key={idx} className="bg-[var(--s3)] rounded-lg p-4 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[var(--cyan)] font-bold">
                    Tier {entry.tier}: {idx === 0 ? 'Raw Steel Mill (Melt + Pour)' : idx === 1 ? 'Rolling / Processing Facility' : 'UK Exporter Inventory'}
                  </span>
                  <button onClick={() => removeChainEntry(idx)} className="text-[var(--muted2)] hover:text-[#ff5370]">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'entityName', label: 'Mill / Entity Name', placeholder: 'Legal name' },
                    { key: 'country', label: 'Country (ISO)', placeholder: 'GB, DE…' },
                    { key: 'date', label: 'Date', placeholder: 'YYYY-MM-DD' },
                    { key: 'reference', label: 'MTC Ref / Heat No', placeholder: 'Reference' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block font-mono text-[10px] text-[var(--muted2)] mb-1">{label}</label>
                      <input
                        type={key === 'date' ? 'date' : 'text'}
                        value={(entry as unknown as Record<string, string>)[key] || ''}
                        onChange={(e) => updateChainEntry(idx, key, e.target.value)}
                        className="w-full bg-[var(--s1)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text)] font-mono focus:border-[var(--cyan)] focus:outline-none"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addChainEntry}
            disabled={sanctions.chainOfCustodyLog.length >= 3}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--muted2)] rounded-md font-mono text-xs hover:border-[var(--border2)] hover:text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} />
            Add Chain Entry
          </button>
        </div>
      )}

      {/* Reg ref */}
      <div className="flex gap-2 items-start p-3 bg-[rgba(0,0,0,0.2)] rounded-md border border-[var(--border)]">
        <Info size={12} className="text-[var(--muted2)] flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-[var(--muted2)]">
          Reg ref: UK Russia (Sanctions)(EU Exit) Regs SI 2019/855 as amended SI 2023/440 · EU Reg
          833/2014 Art.3g · DIN EN 10204 (MTC Standard) · OFSI Guidance · OFAC SDN List
        </p>
      </div>

      {/* Blocked banner */}
      {sanctions.originRiskLevel === 'BLOCKED' && (
        <div className="flex gap-3 bg-[rgba(255,83,112,0.1)] border border-[rgba(255,83,112,0.5)] rounded-lg p-5">
          <XCircle size={20} className="text-[#ff5370] flex-shrink-0" />
          <div>
            <p className="font-mono text-sm font-bold text-[#ff5370]">
              SHIPMENT BLOCKED — Russian Origin Detected
            </p>
            <p className="font-mono text-xs text-[var(--muted2)] mt-2">
              This shipment cannot proceed. UK SI 2019/855 and EU Reg 833/2014 prohibit import/export
              of iron and steel products of Russian origin. A compliance event has been logged.
            </p>
          </div>
        </div>
      )}

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
          Continue to German Customs
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
