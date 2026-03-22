"use client";

import Link from "next/link";
import { ArrowLeft, Save, Flag } from "lucide-react";
import { useShipment } from "./ShipmentContext";

const STEP_NAMES = [
  "Classification",
  "Duties & Origin",
  "Proof of Origin",
  "Supplier Declaration",
  "Sanctions & Licences",
  "CDS Declaration",
  "Barrister's Bundle",
];

export function TopBar() {
  const { shipmentId, corridor, hsCode, commodity, weight, currentStep, hardBlock, hardBlockReason } =
    useShipment();

  const progressPct = Math.round(((currentStep - 1) / 6) * 100);

  return (
    <div className="flex-shrink-0 bg-[#0D1F3C] border-b border-[rgba(255,255,255,0.08)]">
      {/* Hard block banner */}
      {hardBlock && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-[rgba(163,45,45,0.9)] border-b border-[rgba(248,113,113,0.4)]">
          <span className="text-sm font-bold text-white">🚫 HARD BLOCK:</span>
          <span className="text-sm text-red-100 font-mono">{hardBlockReason}</span>
        </div>
      )}

      {/* Main top bar */}
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Logo + shipment info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <span className="font-mono text-xs font-bold text-[#5BA3D9] tracking-widest uppercase">VERITARIFF</span>
          </div>

          <div className="h-4 w-px bg-[rgba(255,255,255,0.12)]" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm font-bold text-[#F8F6F0] truncate">{shipmentId}</span>
            <span className="text-[#8BA3C1] font-mono text-xs flex-shrink-0">|</span>
            <span className="font-mono text-xs text-[#5BA3D9] flex-shrink-0">🇬🇧 {corridor}</span>
            <span className="text-[#8BA3C1] font-mono text-xs flex-shrink-0">|</span>
            <span className="font-mono text-xs text-[#F8F6F0] flex-shrink-0">HS {hsCode}</span>
            <span className="text-[#8BA3C1] font-mono text-xs flex-shrink-0">|</span>
            <span className="font-mono text-xs text-[#8BA3C1] truncate">
              {weight} · {commodity}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] hover:border-[rgba(255,255,255,0.25)] transition-all font-mono text-xs">
            <Save size={12} />
            Save draft
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] hover:border-[rgba(255,255,255,0.25)] transition-all font-mono text-xs"
          >
            <ArrowLeft size={12} />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Progress bar row */}
      <div className="flex items-center gap-4 px-6 pb-3">
        <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#185FA5] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Flag size={11} className="text-[#8BA3C1]" />
          <span className="font-mono text-[11px] text-[#8BA3C1]">
            Step {currentStep} of 7
          </span>
          <span className="font-mono text-[11px] text-[#5BA3D9] font-bold">
            — {STEP_NAMES[currentStep - 1]}
          </span>
        </div>
      </div>
    </div>
  );
}
