"use client";

import { CheckCircle, Edit2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useShipment } from "../components/ShipmentContext";
import { StatusPill } from "../components/StatusPill";

export function Step1_ClassificationSummary() {
  const { setCurrentStep, setStepStatus } = useShipment();

  const handleConfirm = () => {
    setStepStatus(1, "complete");
    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[#0F6E56] border border-[#34d399] flex items-center justify-center">
              <CheckCircle size={13} className="text-white" />
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 1 — Classification
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            HS code confirmed. Classification complete.
          </p>
        </div>
        <StatusPill status="complete" />
      </div>

      {/* Summary card */}
      <div className="bg-[rgba(15,110,86,0.08)] border border-[rgba(52,211,153,0.2)] rounded-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-1">
              CLASSIFIED ✓
            </p>
            <p className="font-mono text-3xl font-bold text-[#F8F6F0] tracking-wider">
              7224 90 02 89
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] font-mono text-xs font-bold text-[#34d399]">
            <CheckCircle size={12} /> CLASSIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-1">Description</p>
            <p className="font-mono text-sm text-[#F8F6F0]">
              Other alloy steel semi-finished — billets (42CrMo4)
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-1">Steel Class</p>
            <p className="font-mono text-sm text-[#F8F6F0]">Other Alloy Steel</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-1">Classification Path</p>
            <p className="font-mono text-xs text-[#5BA3D9]">
              Other Alloy → Ingot/Semi-finished → 7224
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-1">Supplementary Unit</p>
            <p className="font-mono text-sm text-[#F8F6F0]">kg (tonnes)</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded bg-[rgba(133,79,11,0.2)] border border-[rgba(133,79,11,0.4)] font-mono text-[10px] text-[#f59e0b]">
            ⚠ TRQ Applies
          </span>
          <span className="px-2 py-1 rounded bg-[rgba(133,79,11,0.2)] border border-[rgba(133,79,11,0.4)] font-mono text-[10px] text-[#f59e0b]">
            ⚠ Safeguard Measure
          </span>
          <span className="px-2 py-1 rounded bg-[rgba(24,95,165,0.2)] border border-[rgba(24,95,165,0.4)] font-mono text-[10px] text-[#5BA3D9]">
            CBAM Applicable
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-4">
        <Link
          href="/shipment/new"
          className="flex items-center gap-1.5 font-mono text-xs text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors"
        >
          <Edit2 size={12} />
          Edit classification
        </Link>
        <a
          href="https://www.trade-tariff.service.gov.uk/commodities/7224900289"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-xs text-[#8BA3C1] hover:text-[#5BA3D9] transition-colors"
        >
          <ExternalLink size={12} />
          View on UK Trade Tariff
        </a>
      </div>

      {/* Continue */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleConfirm}
          className="px-6 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Proceed to Step 2 →
        </button>
      </div>
    </div>
  );
}
