"use client";

import type { StepStatus } from "./ShipmentContext";

interface Props {
  status: StepStatus;
  label?: string;
}

const CONFIG: Record<StepStatus, { bg: string; text: string; border: string; dot?: string }> = {
  complete: {
    bg: "bg-[rgba(15,110,86,0.15)]",
    text: "text-[#34d399]",
    border: "border-[rgba(52,211,153,0.3)]",
  },
  active: {
    bg: "bg-[rgba(24,95,165,0.15)]",
    text: "text-[#5BA3D9]",
    border: "border-[rgba(91,163,217,0.4)]",
    dot: "bg-[#5BA3D9] animate-pulse",
  },
  pending: {
    bg: "bg-[rgba(139,163,193,0.08)]",
    text: "text-[#8BA3C1]",
    border: "border-[rgba(139,163,193,0.2)]",
  },
  blocked: {
    bg: "bg-[rgba(163,45,45,0.15)]",
    text: "text-[#f87171]",
    border: "border-[rgba(248,113,113,0.3)]",
  },
};

const LABELS: Record<StepStatus, string> = {
  complete: "COMPLETE",
  active: "ACTIVE",
  pending: "PENDING",
  blocked: "BLOCKED",
};

export function StatusPill({ status, label }: Props) {
  const cfg = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {label ?? LABELS[status]}
    </span>
  );
}
