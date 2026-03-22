"use client";

import { useState } from "react";
import { CheckCircle, Clock, Copy, Check } from "lucide-react";
import { useShipment } from "../components/ShipmentContext";
import { StatusPill } from "../components/StatusPill";

interface DEField {
  de: string;
  label: string;
  value: string;
  autofilled: boolean;
  editable?: boolean;
}

const DE_GROUPS: { title: string; fields: DEField[] }[] = [
  {
    title: "Declaration Type",
    fields: [
      { de: "1/1–1/2", label: "Declaration Type", value: "EX — B1 Standard Export Declaration", autofilled: true },
      { de: "1/10", label: "Procedure", value: "1040 — Permanent export", autofilled: true },
      { de: "1/11", label: "Additional Procedure", value: "000 — No additional procedure", autofilled: true },
    ],
  },
  {
    title: "Additional Information",
    fields: [
      { de: "2/2", label: "Additional Information Code", value: "", autofilled: false, editable: true },
      { de: "2/3", label: "Document Codes", value: "C514 (MTC) · 9022 (Sanctions) · Y128 (CBAM)", autofilled: true },
    ],
  },
  {
    title: "Parties",
    fields: [
      { de: "3/1", label: "Exporter EORI", value: "GB123456789000", autofilled: true },
      { de: "3/18", label: "Declarant EORI", value: "GB987654321000", autofilled: false, editable: true },
    ],
  },
  {
    title: "Delivery & Valuation",
    fields: [
      { de: "4/1", label: "Incoterms", value: "", autofilled: false, editable: true },
      { de: "4/16", label: "Valuation Method", value: "1 — Transaction value", autofilled: true },
    ],
  },
  {
    title: "Goods Location",
    fields: [
      { de: "5/8", label: "Destination Country", value: "DE — Germany", autofilled: true },
      { de: "5/14", label: "Country of Dispatch", value: "GB — Great Britain", autofilled: true },
    ],
  },
  {
    title: "Goods Description",
    fields: [
      { de: "6/1", label: "Net Mass (kg)", value: "", autofilled: false, editable: true },
      { de: "6/5", label: "Gross Mass (kg)", value: "", autofilled: false, editable: true },
      { de: "6/8", label: "Commodity Code", value: "7224900289", autofilled: true },
    ],
  },
];

export function Step6_CDS() {
  const { setCurrentStep, setStepStatus } = useShipment();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    "2/2": "ECONX",
    "3/18": "GB987654321000",
    "4/1": "DAP — Frankfurt am Main",
    "6/1": "500000",
    "6/5": "508000",
  });
  const [transportMode, setTransportMode] = useState("Sea container");
  const [etd, setEtd] = useState("2026-03-28");
  const [mrn, setMrn] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const exsDeadline = (() => {
    if (!etd) return "";
    const d = new Date(etd);
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) + ", 12:00 UTC";
  })();

  const handleSubmit = () => {
    setMrn("26GBIMM0000047VT1");
    setSubmitted(true);
  };

  const handleCopyMrn = async () => {
    await navigator.clipboard.writeText(mrn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    setStepStatus(6, "complete");
    setCurrentStep(7);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[#5BA3D9] flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">6</span>
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 6 — CDS Declaration
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            17 data elements. Green = auto-populated from shipment. Amber = requires input.
          </p>
        </div>
        <StatusPill status="active" />
      </div>

      {/* DE Groups */}
      <div className="space-y-4">
        {DE_GROUPS.map((group) => (
          <div key={group.title} className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
            <h3 className="font-mono text-[10px] font-bold text-[#8BA3C1] uppercase tracking-widest mb-4">
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.fields.map((field) => (
                <div key={field.de} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3">
                  <span className="font-mono text-[10px] text-[#5BA3D9] font-bold">DE {field.de}</span>
                  <div>
                    <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">{field.label}</p>
                    {field.editable ? (
                      <input
                        value={fieldValues[field.de] ?? ""}
                        onChange={(e) => setFieldValues((p) => ({ ...p, [field.de]: e.target.value }))}
                        className="w-full bg-[rgba(133,79,11,0.08)] border border-[rgba(133,79,11,0.35)] rounded-md px-3 py-1.5 font-mono text-xs text-[#F8F6F0] focus:border-[#f59e0b] focus:outline-none placeholder-[#8BA3C1]"
                        placeholder={`Enter ${field.label}…`}
                      />
                    ) : (
                      <p className="font-mono text-xs text-[#F8F6F0]">{field.value}</p>
                    )}
                  </div>
                  {field.autofilled ? (
                    <CheckCircle size={14} className="text-[#34d399] flex-shrink-0" />
                  ) : fieldValues[field.de] ? (
                    <CheckCircle size={14} className="text-[#34d399] flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#f59e0b] flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* EXS Timing Calculator */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-[10px] font-bold text-[#8BA3C1] uppercase tracking-widest mb-4">
          EXS Timing Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-[10px] text-[#8BA3C1] mb-1.5 uppercase tracking-wider">
              Transport Mode
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-md px-3 py-2 font-mono text-xs text-[#F8F6F0] focus:border-[#5BA3D9] focus:outline-none"
            >
              <option>Sea container</option>
              <option>Air freight</option>
              <option>Road (RoRo)</option>
              <option>Rail</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[#8BA3C1] mb-1.5 uppercase tracking-wider">
              ETD (Estimated Time of Departure)
            </label>
            <input
              type="date"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-md px-3 py-2 font-mono text-xs text-[#F8F6F0] focus:border-[#5BA3D9] focus:outline-none"
            />
          </div>
        </div>
        {exsDeadline && (
          <div className="bg-[rgba(133,79,11,0.1)] border border-[rgba(133,79,11,0.3)] rounded-lg p-3">
            <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">EXS must be lodged by:</p>
            <p className="font-mono text-sm font-bold text-[#f59e0b]">{exsDeadline}</p>
            <p className="font-mono text-[10px] text-[#8BA3C1] mt-1">← 24h before departure (container sea rule)</p>
            <button className="flex items-center gap-1.5 mt-2 font-mono text-[11px] text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors">
              <Clock size={12} />
              Set reminder
            </button>
          </div>
        )}
      </div>

      {/* Submit + MRN */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          🚀 Submit to HMRC CDS
        </button>
      ) : (
        <div className="p-4 bg-[rgba(15,110,86,0.12)] border border-[rgba(52,211,153,0.3)] rounded-xl">
          <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-2">
            Declaration Accepted — MRN Issued
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-lg font-bold text-[#34d399]">{mrn}</p>
            <button onClick={handleCopyMrn} className="text-[#8BA3C1] hover:text-[#F8F6F0] transition-colors">
              {copied ? <Check size={14} className="text-[#34d399]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentStep(5)}
          className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!submitted}
          className="px-6 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Proceed to Step 7 →
        </button>
      </div>
    </div>
  );
}
