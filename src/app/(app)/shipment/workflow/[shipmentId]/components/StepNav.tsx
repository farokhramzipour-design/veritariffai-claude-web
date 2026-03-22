"use client";

import { Check, AlertTriangle, XCircle, Circle, Loader2 } from "lucide-react";
import { useShipment, STEP_TIMES, type StepStatus } from "./ShipmentContext";

const STEPS = [
  { number: 1, name: "Classification", sub: "HS Code verified" },
  { number: 2, name: "Duties & Origin", sub: "MFN + TCA + TRQ" },
  { number: 3, name: "Proof of Origin", sub: "5 method selector" },
  { number: 4, name: "Supplier Declaration", sub: "MTC + declaration" },
  { number: 5, name: "Sanctions & Licences", sub: "Gate-check list" },
  { number: 6, name: "CDS Declaration", sub: "17 data elements" },
  { number: 7, name: "Barrister's Bundle", sub: "Clearance gate" },
];

function StepIcon({ status, number }: { status: StepStatus; number: number }) {
  const base = "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all";
  if (status === "complete") {
    return (
      <div className={`${base} bg-[#0F6E56] border-[#34d399]`}>
        <Check size={13} className="text-white" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className={`${base} bg-[rgba(24,95,165,0.3)] border-[#5BA3D9]`}>
        <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">{number}</span>
      </div>
    );
  }
  if (status === "blocked") {
    return (
      <div className={`${base} bg-[rgba(163,45,45,0.2)] border-[#f87171]`}>
        <XCircle size={13} className="text-[#f87171]" />
      </div>
    );
  }
  // pending
  return (
    <div className={`${base} bg-transparent border-[rgba(139,163,193,0.25)]`}>
      <span className="font-mono text-[11px] text-[#8BA3C1]">{number}</span>
    </div>
  );
}

export function StepNav() {
  const { currentStep, stepStatuses, setCurrentStep } = useShipment();

  return (
    <div className="w-56 flex-shrink-0 bg-[#0D1F3C] border-r border-[rgba(255,255,255,0.08)] overflow-y-auto">
      <div className="px-4 py-5">
        <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-4">
          Workflow Steps
        </p>

        <div className="relative">
          {/* Vertical accent line */}
          <div className="absolute left-[13px] top-4 bottom-4 w-px bg-[rgba(139,163,193,0.15)]" />

          <div className="space-y-1">
            {STEPS.map((step) => {
              const status = stepStatuses[step.number];
              const isClickable = status === "complete" || status === "active";

              return (
                <button
                  key={step.number}
                  onClick={() => isClickable && setCurrentStep(step.number)}
                  disabled={!isClickable}
                  className={`w-full flex items-start gap-3 px-2 py-3 rounded-lg transition-all text-left relative z-10 ${
                    status === "active"
                      ? "bg-[rgba(24,95,165,0.15)] border border-[rgba(91,163,217,0.2)]"
                      : isClickable
                      ? "hover:bg-[rgba(255,255,255,0.04)] cursor-pointer"
                      : "cursor-default opacity-60"
                  }`}
                >
                  <StepIcon status={status} number={step.number} />

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-mono text-[11px] font-bold leading-tight ${
                          status === "active"
                            ? "text-[#F8F6F0]"
                            : status === "complete"
                            ? "text-[#F8F6F0]"
                            : status === "blocked"
                            ? "text-[#f87171]"
                            : "text-[#8BA3C1]"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8BA3C1] mt-0.5 leading-tight">{step.sub}</p>
                    <p className="text-[10px] text-[#5BA3D9] mt-0.5 font-mono">{STEP_TIMES[step.number]}</p>
                  </div>

                  {/* Status indicator dot */}
                  {status === "active" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BA3D9] animate-pulse flex-shrink-0 mt-1.5" />
                  )}
                  {status === "complete" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] flex-shrink-0 mt-1.5" />
                  )}
                  {status === "blocked" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f87171] flex-shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
