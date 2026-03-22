"use client";
import { useShipment, StepStatus } from "./ShipmentContext";
import { Check, Circle, AlertTriangle, X, Loader2 } from "lucide-react";

const STEPS = [
  { n: 1, name: "Classification", time: "~2 min" },
  { n: 2, name: "Duties & Origin", time: "~3 min" },
  { n: 3, name: "Proof of Origin", time: "~5 min" },
  { n: 4, name: "Supplier Declaration", time: "~3 min" },
  { n: 5, name: "Sanctions & Licences", time: "~1 min" },
  { n: 6, name: "CDS Declaration", time: "~4 min" },
  { n: 7, name: "Barrister's Bundle", time: "~instant" },
];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "complete") return <Check size={12} className="text-[#34d399]" />;
  if (status === "active") return <Loader2 size={12} className="text-[#60a5fa] animate-spin" />;
  if (status === "blocked") return <AlertTriangle size={12} className="text-[#fbbf24]" />;
  if (status === "hard_blocked") return <X size={12} className="text-[#f87171]" />;
  return <Circle size={12} className="text-[#8BA3C1]" />;
}

function stepBorder(status: StepStatus) {
  if (status === "complete") return "border-[#0F6E56]";
  if (status === "active") return "border-[#185FA5]";
  if (status === "blocked") return "border-[#854F0B]";
  if (status === "hard_blocked") return "border-[#A32D2D]";
  return "border-white/15";
}

export function StepNav() {
  const { shipment, activeStep, setActiveStep } = useShipment();

  return (
    <nav className="w-52 flex-shrink-0 flex flex-col py-4 px-3 border-r border-white/8 bg-[#0D1F3C]">
      <p className="text-[9px] font-mono text-[#8BA3C1] uppercase tracking-[0.15em] mb-4 px-2">Workflow</p>
      <div className="relative flex flex-col gap-1">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/8" />

        {STEPS.map((step) => {
          const status = shipment.step_status[step.n];
          const isActive = activeStep === step.n;
          const isClickable = status === "complete" || status === "active";

          return (
            <button
              key={step.n}
              onClick={() => isClickable && setActiveStep(step.n)}
              disabled={!isClickable}
              className={`relative flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-all
                ${isActive ? "bg-[#185FA5]/15 border border-[#185FA5]/30" : "hover:bg-white/4 border border-transparent"}
                ${!isClickable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Step badge */}
              <div className={`relative z-10 w-9 h-9 flex-shrink-0 rounded-full border-2 flex items-center justify-center bg-[#0D1F3C] ${stepBorder(status)}`}>
                {isActive ? (
                  <span className="text-[10px] font-bold text-[#60a5fa]">{step.n}</span>
                ) : (
                  <StepIcon status={status} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${isActive ? "text-[#F8F6F0]" : status === "complete" ? "text-[#34d399]" : "text-[#8BA3C1]"}`}>
                  {step.name}
                </p>
                <p className="text-[9px] font-mono text-[#8BA3C1] mt-0.5">{step.time}</p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
