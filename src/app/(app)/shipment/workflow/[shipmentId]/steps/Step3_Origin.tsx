"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Download, Edit3, Star } from "lucide-react";
import { useShipment } from "../components/ShipmentContext";
import { StatusPill } from "../components/StatusPill";

const METHODS = [
  {
    id: "eur1",
    number: 1,
    name: "EUR.1 Certificate",
    desc: "Physical certificate from customs authority",
    note: "Not required for this case",
    recommended: false,
    available: false,
  },
  {
    id: "statement_on_origin",
    number: 2,
    name: "Statement on Origin",
    desc: "TCA Annex ORIG-4",
    note: "Value £420,040 → EORI required",
    recommended: true,
    available: true,
  },
  {
    id: "importers_knowledge",
    number: 3,
    name: "Importer's Knowledge",
    desc: "No document required",
    note: "Importer bears full liability",
    recommended: false,
    available: true,
  },
  {
    id: "form_a",
    number: 4,
    name: "Form A (GSP)",
    desc: "Generalised Scheme of Preferences",
    note: "N/A — Germany not GSP",
    recommended: false,
    available: false,
  },
  {
    id: "suppliers_declaration",
    number: 5,
    name: "Supplier's Declaration",
    desc: "Supports Statement on Origin",
    note: "See Step 4",
    recommended: false,
    available: true,
  },
];

const STATEMENT_TEXT = `The exporter of the products covered by this document (EORI No: GB123456789000) declares that, except where otherwise clearly indicated, these products are of UK preferential origin.

No cumulation applied.

Goods: Other alloy steel billets (42CrMo4) · HS 7224 90 02 89 · 500 tonnes · Invoice VT-INV-2026-0047
Melt location: United Kingdom (GB) · Heat: [from MTC — upload in Step 4]`;

const VALIDATION = [
  { pass: true, label: "TCA Annex ORIG-4 wording: exact match" },
  { pass: true, label: "EORI GB123456789000: validated via HMRC API" },
  { pass: true, label: 'Cumulation state: "No cumulation applied" — present' },
  { pass: null, label: "Heat number: MTC not uploaded — required for steel", link: "Step 4" },
  { pass: true, label: "Value £420,040 > £5,400: EORI correctly included" },
  { pass: true, label: "Validity: 12 months from today's date" },
];

export function Step3_Origin() {
  const { setCurrentStep, setStepStatus } = useShipment();
  const [selectedMethod, setSelectedMethod] = useState("statement_on_origin");
  const [editing, setEditing] = useState(false);
  const [statementText, setStatementText] = useState(STATEMENT_TEXT);
  const [confirmed, setConfirmed] = useState(false);

  const handleNext = () => {
    setStepStatus(3, "complete");
    setCurrentStep(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[#5BA3D9] flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">3</span>
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 3 — Proof of Origin
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            Select the proof of origin method. AI has pre-selected Method 2 for this shipment.
          </p>
        </div>
        <StatusPill status="active" />
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => m.available && setSelectedMethod(m.id)}
            disabled={!m.available}
            className={`relative text-left p-4 rounded-xl border transition-all ${
              selectedMethod === m.id
                ? "bg-[rgba(24,95,165,0.15)] border-[rgba(91,163,217,0.4)]"
                : m.available
                ? "bg-[rgba(13,31,60,0.6)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                : "bg-[rgba(13,31,60,0.3)] border-[rgba(255,255,255,0.05)] opacity-50"
            }`}
          >
            {m.recommended && (
              <div className="absolute -top-2 left-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#185FA5] font-mono text-[9px] font-bold text-white">
                  <Star size={8} /> RECOMMENDED
                </span>
              </div>
            )}
            <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">Method {m.number}</p>
            <p className="font-mono text-xs font-bold text-[#F8F6F0] mb-1">{m.name}</p>
            <p className="font-mono text-[10px] text-[#5BA3D9]">{m.desc}</p>
            <p className="font-mono text-[10px] text-[#8BA3C1] mt-1">{m.note}</p>
          </button>
        ))}
      </div>

      {/* Statement generator */}
      {selectedMethod === "statement_on_origin" && (
        <div className="bg-[rgba(13,31,60,0.8)] border border-[rgba(91,163,217,0.2)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] text-[#f59e0b] uppercase tracking-widest font-bold">
              AI GENERATED — REVIEW BEFORE SIGNING
            </p>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 font-mono text-[11px] text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors"
            >
              <Edit3 size={12} />
              {editing ? "Done editing" : "✏ Edit"}
            </button>
          </div>

          {editing ? (
            <textarea
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              rows={8}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-lg px-4 py-3 font-mono text-xs text-[#F8F6F0] focus:border-[#5BA3D9] focus:outline-none leading-relaxed resize-none"
            />
          ) : (
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3">
              <p className="font-mono text-xs text-[#F8F6F0] leading-relaxed whitespace-pre-wrap">
                {statementText}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setConfirmed(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F6E56] text-white font-mono text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <CheckCircle size={13} />
              Confirm & Sign
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-xs transition-colors">
              <Download size={13} />
              Download PDF
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-xs transition-colors">
              + Add to Barrister&apos;s Bundle
            </button>
          </div>
        </div>
      )}

      {/* Validation checklist */}
      {selectedMethod === "statement_on_origin" && (
        <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-3">
            Validation Checklist
          </p>
          <div className="space-y-2">
            {VALIDATION.map((v, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {v.pass === true ? (
                  <CheckCircle size={13} className="text-[#34d399] flex-shrink-0 mt-0.5" />
                ) : v.pass === false ? (
                  <AlertTriangle size={13} className="text-[#f87171] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={13} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
                )}
                <p className={`font-mono text-xs ${v.pass === null ? "text-[#f59e0b]" : "text-[#F8F6F0]"}`}>
                  {v.label}
                  {v.link && (
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="ml-1 text-[#5BA3D9] hover:underline"
                    >
                      (link to Step 4)
                    </button>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Proceed to Step 4 →
        </button>
      </div>
    </div>
  );
}
