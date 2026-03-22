"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, ExternalLink, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useShipment } from "../components/ShipmentContext";
import { UploadZone, type UploadResult } from "../components/UploadZone";
import { StatusPill } from "../components/StatusPill";

const DUTY_ROWS = [
  { type: "EU MFN Customs Duty", rate: "0%", status: "pass", note: "Duty Free" },
  { type: "TCA Preferential", rate: "0%", status: "pass", note: "Optional — but claim it" },
  { type: "EU Safeguard (in-quota)", rate: "0%", status: "warn", note: "TRQ check required" },
  { type: "EU Safeguard (out-of-quota)", rate: "25%", status: "warn", note: "Quota at LIVE%" },
  { type: "NEW Safeguard (Jul 2026+)", rate: "50%", status: "warn", note: "If COM(2025)726 adopted" },
  { type: "CBAM", rate: "Variable", status: "warn", note: ">50t threshold: MANDATORY" },
  { type: "German EUSt (Import VAT)", rate: "19%", status: "info", note: "On CIF + duty" },
  { type: "Anti-Dumping / CVD", rate: "None", status: "pass", note: "UK-origin — verify at shipment" },
];

const INPUT_MATERIALS = [
  { input: "Scrap steel", hs: "7204", sameAs7224: false, result: "CTH satisfied" },
  { input: "Ferro-chromium", hs: "7202", sameAs7224: false, result: "CTH satisfied" },
  { input: "Ferro-molybdenum", hs: "7202", sameAs7224: false, result: "CTH satisfied" },
  { input: "Iron ore / DRI", hs: "2601/7203", sameAs7224: false, result: "CTH satisfied" },
];

const SUFFICIENT_OPS = [
  { key: "eaf", label: "EAF melting + continuous casting", sufficient: true },
  { key: "rolling", label: "Hot rolling", sufficient: true },
  { key: "heat", label: "Heat treatment", sufficient: true },
  { key: "cutting", label: "Cutting to length", sufficient: false },
  { key: "surface", label: "Surface treatment", sufficient: false },
];

function DutyStatusIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle size={14} className="text-[#34d399] flex-shrink-0" />;
  if (status === "warn") return <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0" />;
  if (status === "block") return <XCircle size={14} className="text-[#f87171] flex-shrink-0" />;
  return <div className="w-3.5 h-3.5 rounded-full bg-[#5BA3D9] flex-shrink-0" />;
}

export function Step2_Duties() {
  const { setCurrentStep, setStepStatus, triggerHardBlock } = useShipment();
  const [trqAlertSet, setTrqAlertSet] = useState(false);
  const [whollyObtained, setWhollyObtained] = useState<boolean | null>(null);
  const [meltCountry, setMeltCountry] = useState("GB");
  const [pourCountry, setPourCountry] = useState("GB");
  const [euInputs, setEuInputs] = useState<boolean | null>(null);
  const [checkedOps, setCheckedOps] = useState<string[]>(["eaf", "rolling", "heat"]);
  const [suppDecUploaded, setSuppDecUploaded] = useState(false);
  const [sooUploaded, setSooUploaded] = useState(false);
  const [showInputTable, setShowInputTable] = useState(false);

  const trqPct = 68;
  const trqColor = trqPct > 50 ? "bg-[#0F6E56]" : trqPct > 25 ? "bg-[#854F0B]" : "bg-[#A32D2D]";
  const trqTextColor = trqPct > 50 ? "text-[#34d399]" : trqPct > 25 ? "text-[#f59e0b]" : "text-[#f87171]";

  const meltBlocked = meltCountry === "RU" || meltCountry === "BY" || pourCountry === "RU" || pourCountry === "BY";

  const handleMeltCountryChange = (val: string) => {
    setMeltCountry(val);
    if (val === "RU" || val === "BY") {
      triggerHardBlock("Russian/Belarusian melt origin detected. This shipment cannot proceed. This is not a classification issue — it is a sanctions violation.");
    }
  };
  const handlePourCountryChange = (val: string) => {
    setPourCountry(val);
    if (val === "RU" || val === "BY") {
      triggerHardBlock("Russian/Belarusian pour origin detected. This shipment cannot proceed.");
    }
  };

  const originConfirmed =
    !meltBlocked &&
    whollyObtained !== null &&
    (whollyObtained || (meltCountry === "GB" && pourCountry === "GB"));

  const handleNext = () => {
    setStepStatus(2, "complete");
    setCurrentStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[#5BA3D9] flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">2</span>
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 2 — Duties & Rules of Origin
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            MFN gateway, TCA preference, TRQ live quota, and origin determination.
          </p>
        </div>
        <StatusPill status="active" />
      </div>

      {/* 2a — Duty Table */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-xs font-bold text-[#F8F6F0] uppercase tracking-widest mb-4">
          2a — MFN Duty Gateway
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)]">
                <th className="text-left font-mono text-[10px] text-[#8BA3C1] uppercase tracking-wider pb-2 pr-4">Duty Type</th>
                <th className="text-left font-mono text-[10px] text-[#8BA3C1] uppercase tracking-wider pb-2 pr-4">Rate</th>
                <th className="text-left font-mono text-[10px] text-[#8BA3C1] uppercase tracking-wider pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {DUTY_ROWS.map((row) => (
                <tr key={row.type} className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
                  <td className="py-2.5 pr-4">
                    <p className="font-mono text-xs text-[#F8F6F0]">{row.type}</p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="font-mono text-xs font-bold text-[#5BA3D9]">{row.rate}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <DutyStatusIcon status={row.status} />
                      <span className="font-mono text-[11px] text-[#8BA3C1]">{row.note}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRQ Widget */}
      <div className={`border rounded-xl p-5 ${trqPct > 50 ? "bg-[rgba(15,110,86,0.08)] border-[rgba(52,211,153,0.2)]" : trqPct > 25 ? "bg-[rgba(133,79,11,0.08)] border-[rgba(133,79,11,0.25)]" : "bg-[rgba(163,45,45,0.08)] border-[rgba(248,113,113,0.25)]"}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest">TRQ CATEGORY 26 — LIVE QUOTA</p>
            <p className={`font-mono text-2xl font-bold mt-1 ${trqTextColor}`}>{trqPct}% remaining</p>
          </div>
          <button
            onClick={() => setTrqAlertSet(!trqAlertSet)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[11px] transition-all ${
              trqAlertSet
                ? "bg-[rgba(133,79,11,0.2)] border-[rgba(133,79,11,0.4)] text-[#f59e0b]"
                : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:border-[rgba(255,255,255,0.25)]"
            }`}
          >
            <Bell size={12} />
            {trqAlertSet ? "Alert set at 25%" : "⚠ Alert me at 25%"}
          </button>
        </div>
        <div className="h-3 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden mb-2">
          <div className={`h-full ${trqColor} rounded-full transition-all`} style={{ width: `${trqPct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-[#8BA3C1]">Estimated depletion: ~11 weeks at current burn rate</p>
          <a
            href="https://ec.europa.eu/taxation_customs/dds2/taric"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[11px] text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors"
          >
            <ExternalLink size={11} />
            View TARIC
          </a>
        </div>
        <p className="font-mono text-[10px] text-[#8BA3C1] mt-1">
          Last updated: {new Date().toISOString().replace("T", " ").substring(0, 16)} UTC
        </p>
      </div>

      {/* 2b — Rules of Origin */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-xs font-bold text-[#F8F6F0] uppercase tracking-widest mb-4">
          2b — Rules of Origin Decision Tree
        </h3>

        {/* Upload zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {!suppDecUploaded ? (
            <UploadZone
              label="Upload Supplier's Declaration"
              sublabel="TCA Annex ORIG-3"
              onUpload={(r: UploadResult) => setSuppDecUploaded(true)}
            />
          ) : (
            <UploadZone
              label="Supplier's Declaration"
              sublabel="TCA Annex ORIG-3"
              uploadedFile="supplier_declaration.pdf"
              onUpload={(r: UploadResult) => {}}
              onRemove={() => setSuppDecUploaded(false)}
            />
          )}
          {!sooUploaded ? (
            <UploadZone
              label="Upload Statement of Origin"
              sublabel="TCA Annex ORIG-4"
              onUpload={(r: UploadResult) => setSooUploaded(true)}
            />
          ) : (
            <UploadZone
              label="Statement of Origin"
              sublabel="TCA Annex ORIG-4"
              uploadedFile="statement_of_origin.pdf"
              onUpload={(r: UploadResult) => {}}
              onRemove={() => setSooUploaded(false)}
            />
          )}
        </div>

        {/* Gate 3A */}
        <div className="space-y-4">
          <div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg">
            <p className="font-mono text-xs font-bold text-[#F8F6F0] mb-1">Gate 3A — Wholly Obtained</p>
            <p className="font-mono text-[11px] text-[#8BA3C1] mb-3">
              Were ALL materials — including scrap and all ferroalloys — sourced entirely from the UK?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setWhollyObtained(true)}
                className={`px-4 py-2 rounded-lg border font-mono text-xs font-bold transition-all ${
                  whollyObtained === true
                    ? "bg-[rgba(15,110,86,0.2)] border-[#34d399] text-[#34d399]"
                    : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:border-[rgba(255,255,255,0.25)]"
                }`}
              >
                YES
              </button>
              <button
                onClick={() => setWhollyObtained(false)}
                className={`px-4 py-2 rounded-lg border font-mono text-xs font-bold transition-all ${
                  whollyObtained === false
                    ? "bg-[rgba(133,79,11,0.2)] border-[#f59e0b] text-[#f59e0b]"
                    : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:border-[rgba(255,255,255,0.25)]"
                }`}
              >
                NO
              </button>
            </div>
            {whollyObtained === true && (
              <p className="font-mono text-[11px] text-[#34d399] mt-2">
                ✓ WHOLLY OBTAINED — proceed to Step 3
              </p>
            )}
          </div>

          {/* Gate 3B */}
          {whollyObtained === false && (
            <div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg space-y-4">
              <div>
                <p className="font-mono text-xs font-bold text-[#F8F6F0] mb-1">Gate 3B — CTH Rule</p>
                <button
                  onClick={() => setShowInputTable(!showInputTable)}
                  className="flex items-center gap-1.5 font-mono text-[11px] text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors mb-3"
                >
                  {showInputTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  Input materials table
                </button>
                {showInputTable && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.08)]">
                          <th className="text-left font-mono text-[10px] text-[#8BA3C1] pb-2 pr-4">Input</th>
                          <th className="text-left font-mono text-[10px] text-[#8BA3C1] pb-2 pr-4">HS</th>
                          <th className="text-left font-mono text-[10px] text-[#8BA3C1] pb-2 pr-4">Same as 7224?</th>
                          <th className="text-left font-mono text-[10px] text-[#8BA3C1] pb-2">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {INPUT_MATERIALS.map((m) => (
                          <tr key={m.input} className="border-b border-[rgba(255,255,255,0.04)]">
                            <td className="py-2 pr-4 font-mono text-[#F8F6F0]">{m.input}</td>
                            <td className="py-2 pr-4 font-mono text-[#5BA3D9]">{m.hs}</td>
                            <td className="py-2 pr-4 font-mono text-[#34d399]">No</td>
                            <td className="py-2 font-mono text-[#34d399]">✓ {m.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Melt and Pour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-[#8BA3C1] uppercase tracking-wider mb-1.5">
                      Where did melting occur?
                    </label>
                    <input
                      value={meltCountry}
                      onChange={(e) => handleMeltCountryChange(e.target.value.toUpperCase())}
                      maxLength={2}
                      placeholder="ISO code e.g. GB"
                      className={`w-full px-3 py-2 rounded-md font-mono text-sm border focus:outline-none transition-colors ${
                        meltCountry === "RU" || meltCountry === "BY"
                          ? "bg-[rgba(163,45,45,0.1)] border-[#f87171] text-[#f87171]"
                          : meltCountry === "GB"
                          ? "bg-[rgba(15,110,86,0.08)] border-[rgba(52,211,153,0.3)] text-[#F8F6F0]"
                          : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.12)] text-[#F8F6F0]"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#8BA3C1] uppercase tracking-wider mb-1.5">
                      Where did casting/pour occur?
                    </label>
                    <input
                      value={pourCountry}
                      onChange={(e) => handlePourCountryChange(e.target.value.toUpperCase())}
                      maxLength={2}
                      placeholder="ISO code e.g. GB"
                      className={`w-full px-3 py-2 rounded-md font-mono text-sm border focus:outline-none transition-colors ${
                        pourCountry === "RU" || pourCountry === "BY"
                          ? "bg-[rgba(163,45,45,0.1)] border-[#f87171] text-[#f87171]"
                          : pourCountry === "GB"
                          ? "bg-[rgba(15,110,86,0.08)] border-[rgba(52,211,153,0.3)] text-[#F8F6F0]"
                          : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.12)] text-[#F8F6F0]"
                      }`}
                    />
                  </div>
                </div>

                {meltCountry === "GB" && pourCountry === "GB" && (
                  <p className="font-mono text-[11px] text-[#34d399] mt-2">
                    ✓ MELT + POUR: UK — origin-conferring operations confirmed
                  </p>
                )}
                {(meltCountry === "RU" || meltCountry === "BY" || pourCountry === "RU" || pourCountry === "BY") && (
                  <div className="mt-2 p-3 bg-[rgba(163,45,45,0.15)] border border-[rgba(248,113,113,0.4)] rounded-lg">
                    <p className="font-mono text-xs font-bold text-[#f87171]">
                      🚫 HARD BLOCK: Russian/Belarusian melt origin detected. This shipment cannot proceed. This is not a classification issue — it is a sanctions violation.
                    </p>
                  </div>
                )}
              </div>

              {/* Gate 3C */}
              {!meltBlocked && (
                <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
                  <p className="font-mono text-xs font-bold text-[#F8F6F0] mb-2">Gate 3C — Cumulation</p>
                  <p className="font-mono text-[11px] text-[#8BA3C1] mb-3">
                    Do any input materials originate in the EU?
                  </p>
                  <div className="flex gap-3">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => setEuInputs(v)}
                        className={`px-4 py-2 rounded-lg border font-mono text-xs font-bold transition-all ${
                          euInputs === v
                            ? v
                              ? "bg-[rgba(133,79,11,0.2)] border-[#f59e0b] text-[#f59e0b]"
                              : "bg-[rgba(15,110,86,0.2)] border-[#34d399] text-[#34d399]"
                            : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:border-[rgba(255,255,255,0.25)]"
                        }`}
                      >
                        {v ? "YES" : "NO"}
                      </button>
                    ))}
                  </div>
                  {euInputs === true && (
                    <p className="font-mono text-[11px] text-[#f59e0b] mt-2">
                      ⚠ EU supplier declaration required. Statement must say "Cumulation applied with EU".
                    </p>
                  )}
                  {euInputs === false && (
                    <p className="font-mono text-[11px] text-[#34d399] mt-2">
                      ✓ No EU inputs — no cumulation required
                    </p>
                  )}
                </div>
              )}

              {/* Gate 3D */}
              {!meltBlocked && euInputs !== null && (
                <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
                  <p className="font-mono text-xs font-bold text-[#F8F6F0] mb-2">Gate 3D — Sufficient Processing</p>
                  <p className="font-mono text-[11px] text-[#8BA3C1] mb-3">
                    Which operations were performed in the UK?
                  </p>
                  <div className="space-y-2">
                    {SUFFICIENT_OPS.map((op) => (
                      <label key={op.key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setCheckedOps((prev) =>
                            prev.includes(op.key)
                              ? prev.filter((k) => k !== op.key)
                              : [...prev, op.key]
                          )}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                            checkedOps.includes(op.key)
                              ? "bg-[#185FA5] border-[#5BA3D9]"
                              : "bg-transparent border-[rgba(255,255,255,0.2)]"
                          }`}
                        >
                          {checkedOps.includes(op.key) && (
                            <CheckCircle size={10} className="text-white" />
                          )}
                        </div>
                        <span className="font-mono text-xs text-[#F8F6F0]">{op.label}</span>
                        {!op.sufficient && (
                          <span className="font-mono text-[10px] text-[#f59e0b]">NOT sufficient alone</span>
                        )}
                        {op.sufficient && (
                          <span className="font-mono text-[10px] text-[#34d399]">origin-conferring</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Origin Result */}
          {originConfirmed && (
            <div className="p-4 bg-[rgba(15,110,86,0.12)] border border-[rgba(52,211,153,0.3)] rounded-xl">
              <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-2">ORIGIN DETERMINATION</p>
              <p className="font-mono text-sm font-bold text-[#34d399] mb-2">✓ UK PREFERENTIAL ORIGIN CONFIRMED</p>
              <div className="space-y-1">
                <p className="font-mono text-[11px] text-[#F8F6F0]">
                  Basis: CTH satisfied · Melt+pour UK
                </p>
                <p className="font-mono text-[11px] text-[#F8F6F0]">
                  Cumulation: {euInputs ? "Cumulation applied with EU" : "No cumulation applied"}
                </p>
                <p className="font-mono text-[11px] text-[#5BA3D9]">
                  Evidence: MTC required (Step 4)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!originConfirmed && !sooUploaded}
          className="px-6 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Proceed to Step 3 →
        </button>
      </div>
    </div>
  );
}
