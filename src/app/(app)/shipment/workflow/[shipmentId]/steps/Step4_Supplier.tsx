"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useShipment } from "../components/ShipmentContext";
import { UploadZone, type UploadResult } from "../components/UploadZone";
import { StatusPill } from "../components/StatusPill";

type Role = "supplier" | "exporter_manufacturer" | "exporter_reexport" | "importer";
type DurationType = "one_off" | "long_term";

interface MtcField {
  field: string;
  value: string;
  confidence: number;
  status: "pass" | "warn" | "fail";
  note?: string;
}

const MOCK_MTC_FIELDS: MtcField[] = [
  { field: "Melt country", value: "United Kingdom (GB)", confidence: 99, status: "pass" },
  { field: "Pour country", value: "United Kingdom (GB)", confidence: 98, status: "pass" },
  { field: "Heat number", value: "2026-EAF3-1847", confidence: 97, status: "pass" },
  { field: "Production route", value: "EAF", confidence: 94, status: "pass" },
  { field: "Cr content", value: "0.98%", confidence: 92, status: "pass", note: "✓ Alloy min met" },
  { field: "Mo content", value: "0.22%", confidence: 91, status: "pass", note: "✓ Alloy min met" },
  { field: "Issue date", value: "15 March 2026", confidence: 99, status: "pass", note: "✓ Within 12 months" },
];

const DECLARATION_FIELDS = [
  "Identification of goods",
  "Origin country",
  "Cumulation state (auto-set from Gate 3C)",
  "Dates (long-term only)",
  "Authorisation (signature)",
];

export function Step4_Supplier() {
  const { setCurrentStep, setStepStatus, triggerHardBlock } = useShipment();
  const [role, setRole] = useState<Role>("exporter_manufacturer");
  const [mtcUploaded, setMtcUploaded] = useState(false);
  const [mtcFileName, setMtcFileName] = useState("");
  const [mtcHash, setMtcHash] = useState("");
  const [showExtraction, setShowExtraction] = useState(false);
  const [durationType, setDurationType] = useState<DurationType>("one_off");
  const [checkedFields, setCheckedFields] = useState<string[]>([]);

  const handleMtcUpload = (result: UploadResult) => {
    setMtcUploaded(true);
    setMtcFileName(result.fileName);
    setMtcHash(result.sha256);
    // Simulate async extraction
    setTimeout(() => setShowExtraction(true), 800);
  };

  const handleNext = () => {
    setStepStatus(4, "complete");
    setCurrentStep(5);
  };

  const ROLES: { value: Role; label: string }[] = [
    { value: "supplier", label: "UK Supplier" },
    { value: "exporter_manufacturer", label: "Exporter (manufacturer)" },
    { value: "exporter_reexport", label: "Exporter (re-export)" },
    { value: "importer", label: "Importer" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[#5BA3D9] flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">4</span>
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 4 — Supplier Declaration
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            MTC upload, AI extraction, and declaration generation.
          </p>
        </div>
        <StatusPill status="active" />
      </div>

      {/* Part A — Role selector */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-xs font-bold text-[#F8F6F0] uppercase tracking-widest mb-3">
          Part A — Your Role
        </h3>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`px-4 py-2 rounded-lg border font-mono text-xs transition-all ${
                role === r.value
                  ? "bg-[rgba(24,95,165,0.2)] border-[#5BA3D9] text-[#F8F6F0]"
                  : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:border-[rgba(255,255,255,0.25)]"
              }`}
            >
              {r.value === role && "● "}
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Part B — MTC Upload */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-xs font-bold text-[#F8F6F0] uppercase tracking-widest mb-2">
          Part B — Mill Test Certificate
        </h3>
        <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">
          EN 10204 3.1 or 3.2 · Required for: TCA origin proof · CBAM SEE · Sanctions screen
        </p>
        <p className="font-mono text-[10px] text-[#5BA3D9] mb-4">
          AI will extract: Melt location · Heat number · Pour location · Chemical composition · CBAM production route
        </p>

        {!mtcUploaded ? (
          <UploadZone
            label="Drop MTC here or browse"
            sublabel="Mill Test Certificate (EN 10204 3.1 or 3.2)"
            onUpload={handleMtcUpload}
          />
        ) : (
          <UploadZone
            label="Mill Test Certificate"
            sublabel="EN 10204 3.1/3.2"
            uploadedFile={mtcFileName}
            onUpload={handleMtcUpload}
            onRemove={() => { setMtcUploaded(false); setShowExtraction(false); }}
          />
        )}

        {mtcHash && (
          <p className="font-mono text-[10px] text-[#8BA3C1] mt-2">
            SHA-256: <span className="text-[#5BA3D9]">{mtcHash.slice(0, 8)}…{mtcHash.slice(-8)}</span>
          </p>
        )}

        {/* Extraction results */}
        {showExtraction && (
          <div className="mt-4">
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-3">
              AI Extraction Results
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.08)]">
                    {["Field", "Extracted Value", "Confidence", "Status"].map((h) => (
                      <th key={h} className="text-left font-mono text-[10px] text-[#8BA3C1] uppercase tracking-wider pb-2 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_MTC_FIELDS.map((f) => (
                    <tr key={f.field} className="border-b border-[rgba(255,255,255,0.04)]">
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#F8F6F0]">{f.field}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#5BA3D9]">{f.value}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`font-mono text-xs font-bold ${
                            f.confidence >= 90
                              ? "text-[#34d399]"
                              : f.confidence >= 80
                              ? "text-[#f59e0b]"
                              : "text-[#f87171]"
                          }`}
                        >
                          {f.confidence}%
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          {f.status === "pass" ? (
                            <CheckCircle size={12} className="text-[#34d399]" />
                          ) : f.status === "warn" ? (
                            <AlertTriangle size={12} className="text-[#f59e0b]" />
                          ) : (
                            <XCircle size={12} className="text-[#f87171]" />
                          )}
                          {f.note && (
                            <span className="font-mono text-[10px] text-[#8BA3C1]">{f.note}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Part C — Declaration writer */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-xs font-bold text-[#F8F6F0] uppercase tracking-widest mb-4">
          Part C — Declaration Writer
        </h3>

        {/* Duration toggle */}
        <div className="flex items-center gap-2 mb-5">
          <p className="font-mono text-[11px] text-[#8BA3C1] mr-2">Duration:</p>
          {(["one_off", "long_term"] as DurationType[]).map((d) => (
            <button
              key={d}
              onClick={() => setDurationType(d)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                durationType === d
                  ? "bg-[rgba(24,95,165,0.2)] border-[#5BA3D9] text-[#F8F6F0]"
                  : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:border-[rgba(255,255,255,0.25)]"
              }`}
            >
              {d === "one_off" ? "One-off" : "Long-term (recurring)"}
            </button>
          ))}
        </div>

        {/* Fields checklist */}
        <div className="space-y-2.5">
          {DECLARATION_FIELDS.filter((f) =>
            durationType === "one_off" ? !f.includes("(long-term") : true
          ).map((field) => (
            <label key={field} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() =>
                  setCheckedFields((prev) =>
                    prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
                  )
                }
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                  checkedFields.includes(field)
                    ? "bg-[#185FA5] border-[#5BA3D9]"
                    : "bg-transparent border-[rgba(255,255,255,0.2)]"
                }`}
              >
                {checkedFields.includes(field) && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className="font-mono text-xs text-[#F8F6F0]">{field}</span>
            </label>
          ))}
        </div>

        {checkedFields.length >= 3 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F6E56] text-white font-mono text-xs font-bold hover:opacity-90 transition-opacity">
              <CheckCircle size={13} />
              Generate Declaration
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-xs transition-colors">
              + Add to Barrister&apos;s Bundle
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Proceed to Step 5 →
        </button>
      </div>
    </div>
  );
}
