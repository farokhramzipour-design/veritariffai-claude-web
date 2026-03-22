"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2, Plus } from "lucide-react";
import { useShipment } from "../components/ShipmentContext";
import { StatusPill } from "../components/StatusPill";

interface Gate {
  id: string;
  title: string;
  lines: { text: string; status: "pass" | "warn" | "fail" | "info" }[];
  footer?: string;
}

const GATES: Gate[] = [
  {
    id: "sec_export",
    title: "Gate 1: Strategic Export Control",
    lines: [
      { text: "HS 7224900289 — NOT CONTROLLED under UK SECL", status: "pass" },
      { text: "No SIEL/OIEL required. Verify at shipment date.", status: "info" },
    ],
  },
  {
    id: "sanctions",
    title: "Gate 2: Sanctions Screen",
    lines: [
      { text: "Sheffield Alloy Works Ltd (GB EORI: GB123456789000) — CLEAR", status: "pass" },
      { text: "Stahlhandel Meier GmbH (DE EORI: DE4567890120) — CLEAR", status: "pass" },
      { text: "Meridian Freight Ltd (GB EORI: GB987654321000) — CLEAR", status: "pass" },
      { text: "Melt origin: United Kingdom (GB) — CLEAR (Not RU/BY)", status: "pass" },
    ],
    footer: "Screened against: OFSI · UN · OFAC · EU Consolidated · BIS · UFLPA",
  },
  {
    id: "taric",
    title: "Gate 3: EU Prior Surveillance (TARIC V710)",
    lines: [
      { text: "No V710 measure active for HS 7224900289 at current date", status: "pass" },
      { text: "Fetched live from EU TARIC. Next check at shipment date.", status: "info" },
    ],
  },
  {
    id: "melt_pour",
    title: "Gate 4: Melt and Pour Declaration",
    lines: [
      { text: "Melt country: GB (from MTC SAW-MTC-2026-1847)", status: "pass" },
      { text: "Pour country: GB (from MTC SAW-MTC-2026-1847)", status: "pass" },
      { text: "Heat number: 2026-EAF3-1847 (present)", status: "pass" },
      { text: "Mandatory from 1 October 2026. Currently: advisory.", status: "info" },
    ],
  },
];

function GateRow({ gate, loading, done }: { gate: Gate; loading: boolean; done: boolean }) {
  return (
    <div className="p-4 bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        {loading ? (
          <Loader2 size={14} className="text-[#5BA3D9] animate-spin flex-shrink-0" />
        ) : done ? (
          <CheckCircle size={14} className="text-[#34d399] flex-shrink-0" />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[rgba(255,255,255,0.2)] flex-shrink-0" />
        )}
        <p className="font-mono text-xs font-bold text-[#F8F6F0]">{gate.title}</p>
      </div>

      {loading && (
        <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#185FA5] rounded-full animate-pulse w-3/4" />
        </div>
      )}

      {done && (
        <div className="space-y-1.5 ml-5">
          {gate.lines.map((l, i) => (
            <div key={i} className="flex items-start gap-2">
              {l.status === "pass" ? (
                <span className="text-[#34d399] font-mono text-xs flex-shrink-0">→ ✓</span>
              ) : l.status === "warn" ? (
                <span className="text-[#f59e0b] font-mono text-xs flex-shrink-0">→ ⚠</span>
              ) : l.status === "fail" ? (
                <span className="text-[#f87171] font-mono text-xs flex-shrink-0">→ ✗</span>
              ) : (
                <span className="text-[#8BA3C1] font-mono text-xs flex-shrink-0">  </span>
              )}
              <p className="font-mono text-xs text-[#F8F6F0]">{l.text}</p>
            </div>
          ))}
          {gate.footer && (
            <p className="font-mono text-[10px] text-[#8BA3C1] mt-1.5 ml-5">{gate.footer}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Step5_Sanctions() {
  const { setCurrentStep, setStepStatus } = useShipment();
  const [loadingGate, setLoadingGate] = useState<string | null>(null);
  const [doneGates, setDoneGates] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [cbamAdded, setCbamAdded] = useState(false);

  const runChecks = async () => {
    setRunning(true);
    for (const gate of GATES) {
      setLoadingGate(gate.id);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
      setDoneGates((prev) => [...prev, gate.id]);
      setLoadingGate(null);
    }
    setRunning(false);
  };

  const allPassed = doneGates.length === GATES.length;

  const handleNext = () => {
    setStepStatus(5, "complete");
    setCurrentStep(6);
  };

  // CBAM numbers
  const tonnes = 500;
  const seeActual = 0.468;
  const seeDefault = 1.987;
  const carbonPrice = 78;
  const liabilityActual = Math.round(tonnes * seeActual * carbonPrice);
  const liabilityDefault = Math.round(tonnes * seeDefault * carbonPrice);
  const saving = liabilityDefault - liabilityActual;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[#5BA3D9] flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">5</span>
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 5 — Sanctions & Licences
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            Automated gate-check across sanctions lists, export controls, and TARIC.
          </p>
        </div>
        <StatusPill status="active" />
      </div>

      {/* Run button */}
      {!running && doneGates.length === 0 && (
        <button
          onClick={runChecks}
          className="w-full py-3 rounded-xl bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Run All Gate Checks
        </button>
      )}

      {/* Gates */}
      <div className="space-y-3">
        {GATES.map((gate) => (
          <GateRow
            key={gate.id}
            gate={gate}
            loading={loadingGate === gate.id}
            done={doneGates.includes(gate.id)}
          />
        ))}
      </div>

      {/* CBAM card */}
      {allPassed && (
        <div className="bg-[rgba(24,95,165,0.08)] border border-[rgba(91,163,217,0.25)] rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] text-[#f59e0b] uppercase tracking-widest font-bold">
                CBAM — MANDATORY (500t &gt; 50t threshold) · EU Reg 2023/956
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs">
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">Production route</p>
              <p className="font-mono font-bold text-[#F8F6F0]">EAF (from MTC)</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">Actual SEE</p>
              <p className="font-mono font-bold text-[#34d399]">{seeActual} tCO₂/t</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">BF-BOF default</p>
              <p className="font-mono font-bold text-[#f59e0b]">{seeDefault} tCO₂/t</p>
            </div>
          </div>

          <div className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-[11px] text-[#8BA3C1]">YOUR LIABILITY (actual data):</p>
              <p className="font-mono text-base font-bold text-[#34d399]">~€{liabilityActual.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-[11px] text-[#8BA3C1]">IF DEFAULTS USED:</p>
              <p className="font-mono text-base font-bold text-[#f59e0b]">~€{liabilityDefault.toLocaleString()}</p>
            </div>
            <div className="border-t border-[rgba(255,255,255,0.08)] pt-2 mt-2 flex items-center justify-between">
              <p className="font-mono text-[11px] font-bold text-[#F8F6F0]">YOU SAVE:</p>
              <p className="font-mono text-base font-bold text-[#5BA3D9]">€{saving.toLocaleString()} by using actual data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1]">Authorised CBAM Declarant</p>
              <p className="font-mono text-[#F8F6F0]">DE-CBD-2026-88821</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1]">First surrender deadline</p>
              <p className="font-mono text-[#F8F6F0]">30 September 2027</p>
            </div>
          </div>

          <button
            onClick={() => setCbamAdded(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border font-mono text-xs transition-all ${
              cbamAdded
                ? "bg-[rgba(15,110,86,0.2)] border-[#34d399] text-[#34d399]"
                : "border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0]"
            }`}
          >
            <Plus size={12} />
            {cbamAdded ? "✓ Added to Barrister's Bundle" : "+ Add CBAM sheet to Barrister's Bundle"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentStep(4)}
          className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!allPassed}
          className="px-6 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Proceed to Step 6 →
        </button>
      </div>
    </div>
  );
}
