"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { ConfidenceMeter } from "./results/ConfidenceMeter";
import { CostTable } from "./results/CostTable";
import { WarningCards } from "./results/WarningCards";
import { RoODetail } from "./results/RoODetail";
import { ResultsActions } from "./results/ResultsActions";
import { calculationsApi } from "@/lib/api/calculations";

// ─── Type aliases (matching sub-component props) ────────────────────────────
type CostItem = { component: string; rate: string; amount_gbp: number; amount_eur: number; amount_usd: number };
type TotalCost = { gbp: number; eur: number; usd: number };
type Warning = { type: "warning" | "info"; title: string; message: string; action?: string };
type RoOData = { qualifies: "yes" | "no" | "uncertain"; confidence: number; tca_rule: string; reasoning: string; recommended_actions: string[] };
type ConfidenceFactor = { factor: string; contribution: number; source: "LIVE" | "STATIC" | "AI" | "CHECKED" | "LIVE 1h cache" };

function n(v: unknown): number { return typeof v === "number" ? v : parseFloat(String(v ?? 0)) || 0; }
function s(v: unknown): string { return v == null ? "" : String(v); }

function extractDisplay(result: Record<string, unknown>) {
  const confidence = n(result.confidence ?? result.confidence_score ?? result.estimate_confidence ?? 0);

  const rawFactors = (result.confidence_factors ?? result.factors ?? []) as Array<Record<string, unknown>>;
  const factors: ConfidenceFactor[] = rawFactors.map(f => ({
    factor: s(f.factor ?? f.name ?? f.component),
    contribution: n(f.contribution ?? f.weight ?? f.score),
    source: s(f.source ?? "LIVE") as ConfidenceFactor["source"],
  }));

  // Try multiple possible shapes for line items
  const rawLines = (
    result.lines ?? result.line_results ?? result.line_items ?? result.cost_breakdown ?? []
  ) as Array<Record<string, unknown>>;

  const breakdown: CostItem[] = rawLines.flatMap((l) => {
    // Each line might itself have a breakdown array
    const inner = (l.breakdown ?? l.duties ?? l.charges ?? []) as Array<Record<string, unknown>>;
    if (inner.length) {
      return inner.map(item => ({
        component: s(item.component ?? item.name ?? item.type ?? l.hs_code ?? "Charge"),
        rate: item.rate != null ? `${n(item.rate) * (n(item.rate) <= 1 ? 100 : 1)}%` : "—",
        amount_gbp: n(item.amount_gbp ?? item.amount ?? item.value_gbp),
        amount_eur: n(item.amount_eur ?? item.value_eur ?? 0),
        amount_usd: n(item.amount_usd ?? item.value_usd ?? 0),
      }));
    }
    return [{
      component: s(l.component ?? l.description ?? l.hs_code ?? l.name ?? "Line item"),
      rate: l.duty_rate != null ? `${n(l.duty_rate) * (n(l.duty_rate) <= 1 ? 100 : 1)}%`
          : l.import_duty_rate != null ? `${n(l.import_duty_rate) * 100}%`
          : l.rate != null ? s(l.rate) : "—",
      amount_gbp: n(l.amount_gbp ?? l.total_gbp ?? l.landed_cost_gbp ?? l.customs_value_gbp ?? l.duty_gbp),
      amount_eur: n(l.amount_eur ?? l.total_eur ?? 0),
      amount_usd: n(l.amount_usd ?? l.total_usd ?? 0),
    }];
  });

  const t = (result.totals ?? result.total ?? result.summary ?? {}) as Record<string, unknown>;
  const total: TotalCost = {
    gbp: n(t.gbp ?? t.total_gbp ?? t.total_landed_cost_gbp ?? result.total_landed_cost_gbp ?? result.total_gbp ?? result.landed_cost_gbp),
    eur: n(t.eur ?? t.total_eur ?? t.total_landed_cost_eur ?? result.total_landed_cost_eur),
    usd: n(t.usd ?? t.total_usd ?? t.total_landed_cost_usd ?? result.total_landed_cost_usd),
  };

  const rawWarnings = (result.warnings ?? result.issues ?? result.alerts ?? []) as Array<Record<string, unknown>>;
  const warnings: Warning[] = rawWarnings.map(w => ({
    type: s(w.type ?? w.severity ?? "info").toLowerCase().includes("warn") ? "warning" : "info",
    title: s(w.title ?? w.code ?? w.name ?? "Notice"),
    message: s(w.message ?? w.detail ?? w.description ?? ""),
    action: w.action ? s(w.action) : undefined,
  }));

  const rooRaw = (result.roo ?? result.rules_of_origin ?? result.origin_analysis) as Record<string, unknown> | undefined;
  const roo: RoOData | null = rooRaw ? {
    qualifies: s(rooRaw.qualifies ?? rooRaw.status ?? rooRaw.result ?? "uncertain").toLowerCase() as RoOData["qualifies"],
    confidence: n(rooRaw.confidence ?? rooRaw.confidence_score ?? 0),
    tca_rule: s(rooRaw.tca_rule ?? rooRaw.rule ?? rooRaw.applicable_rule ?? "—"),
    reasoning: s(rooRaw.reasoning ?? rooRaw.explanation ?? rooRaw.notes ?? ""),
    recommended_actions: Array.isArray(rooRaw.recommended_actions) ? (rooRaw.recommended_actions as unknown[]).map(s) : [],
  } : null;

  return { confidence, factors, breakdown, total, warnings, roo };
}

// ─── Dummy preview data ──────────────────────────────────────────────────────
const DUMMY_FACTORS: ConfidenceFactor[] = [
  { factor: "HS Code accuracy", contribution: 30, source: "LIVE" },
  { factor: "Duty rate", contribution: 25, source: "LIVE" },
  { factor: "Rules of Origin", contribution: 15, source: "CHECKED" },
  { factor: "VAT rate", contribution: 10, source: "STATIC" },
  { factor: "Anti-dumping", contribution: 8, source: "LIVE" },
  { factor: "FX rate", contribution: 5, source: "LIVE 1h cache" },
];
const DUMMY_BREAKDOWN: CostItem[] = [
  { component: "Declared Value", rate: "—", amount_gbp: 2000, amount_eur: 2340, amount_usd: 2600 },
  { component: "Import Duty (MFN)", rate: "4.5%", amount_gbp: 90, amount_eur: 105.3, amount_usd: 117 },
  { component: "Import VAT", rate: "20%", amount_gbp: 418, amount_eur: 489.06, amount_usd: 543.4 },
];
const DUMMY_TOTAL: TotalCost = { gbp: 2508, eur: 2934.36, usd: 3260.4 };
const DUMMY_WARNINGS: Warning[] = [{
  type: "warning",
  title: "Rules of Origin — Preferential Rate NOT Applied",
  message: "This product may not qualify for the UK-EU TCA 0% preferential duty rate. Standard MFN rate of 4.5% has been applied.",
  action: "View RoO Details",
}];
const DUMMY_ROO: RoOData = {
  qualifies: "uncertain",
  confidence: 62,
  tca_rule: "Manufacture from materials of any heading, except from headings 64.01 to 64.05",
  reasoning: "Unable to confirm origin of materials. If materials are sourced from UK/EU, the product likely qualifies.",
  recommended_actions: ["Obtain supplier declaration confirming UK/EU origin of materials"],
};

// ─── Raw JSON viewer ─────────────────────────────────────────────────────────
function RawResult({ result }: { result: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const json = JSON.stringify(result, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--s2)] text-xs font-mono text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
      >
        <span>Raw API response</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">{Object.keys(result).length} fields</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {expanded && (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-[var(--s3)] text-[10px] text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
          >
            {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
          </button>
          <pre className="p-4 text-xs font-mono text-[var(--muted2)] overflow-x-auto whitespace-pre-wrap bg-[var(--bg)] max-h-96 overflow-y-auto">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ResultsPanelProps {
  result?: Record<string, unknown> | null;
  requestId?: string | null;
  onNewCalculation?: () => void;
}

export const ResultsPanel = ({ result, requestId, onNewCalculation }: ResultsPanelProps) => {
  const router = useRouter();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const isReal = !!result;
  const { confidence, factors, breakdown, total, warnings, roo } = isReal
    ? extractDisplay(result)
    : { confidence: 91, factors: DUMMY_FACTORS, breakdown: DUMMY_BREAKDOWN, total: DUMMY_TOTAL, warnings: DUMMY_WARNINGS, roo: DUMMY_ROO };

  const hasRealBreakdown = isReal && breakdown.length > 0;
  const hasRealTotal = isReal && total.gbp > 0;

  const handleSaveProfile = async () => {
    if (!result || !saveName.trim()) return;
    setSaveState("saving");
    try {
      await calculationsApi.createProfile({
        name: saveName.trim(),
        shipment_data: (result.input ?? result.request ?? {}) as Record<string, unknown>,
        lines_data: (Array.isArray(result.lines) ? result.lines : [result]) as Record<string, unknown>[],
      });
      setSaveState("saved");
      setShowSaveForm(false);
      setSaveName("");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          {isReal ? "Calculation Results" : "Results Preview"}
        </h2>
        {isReal && requestId && (
          <button
            onClick={() => router.push(`/calculator/result/${requestId}`)}
            className="text-xs text-[var(--cyan)] hover:underline font-mono"
          >
            Full report →
          </button>
        )}
      </div>

      {!isReal && (
        <div className="mb-4 px-3 py-2 bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.15)] rounded text-xs text-[var(--muted2)] font-mono">
          Sample data — fill in origin, destination, and HS code then click Calculate.
        </div>
      )}

      {/* Always show raw API response first when we have a real result */}
      {isReal && <RawResult result={result} />}

      {/* Confidence meter — show if we have a value or using dummy */}
      {(confidence > 0 || !isReal) && (
        <ConfidenceMeter
          confidence={confidence}
          factors={factors.length ? factors : DUMMY_FACTORS}
        />
      )}

      {/* Cost table — show if we have real data or using dummy */}
      {(hasRealBreakdown || !isReal) && (
        <CostTable
          breakdown={hasRealBreakdown ? breakdown : DUMMY_BREAKDOWN}
          total={hasRealTotal ? total : DUMMY_TOTAL}
        />
      )}

      {/* Warnings */}
      {((isReal && warnings.length > 0) || !isReal) && (
        <WarningCards warnings={warnings.length ? warnings : DUMMY_WARNINGS} />
      )}

      {/* Rules of Origin */}
      {((isReal && roo) || !isReal) && (
        <RoODetail roo={roo ?? DUMMY_ROO} />
      )}

      {/* Save as profile */}
      {isReal && (
        <div className="mb-6">
          {showSaveForm ? (
            <div className="flex gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Profile name…"
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
              />
              <button
                onClick={handleSaveProfile}
                disabled={saveState === "saving" || !saveName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--cyan)] text-black font-semibold text-sm disabled:opacity-50"
              >
                {saveState === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
              <button
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)]"
              >
                Cancel
              </button>
            </div>
          ) : saveState === "saved" ? (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={14} /> Saved to profiles
            </div>
          ) : (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--cyan)] transition-colors"
            >
              <Save size={14} /> Save as profile
            </button>
          )}
        </div>
      )}

      <ResultsActions onNewCalculation={onNewCalculation} />
    </div>
  );
};
