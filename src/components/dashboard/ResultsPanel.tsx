import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { ConfidenceMeter } from "./results/ConfidenceMeter";
import { CostTable } from "./results/CostTable";
import { WarningCards } from "./results/WarningCards";
import { RoODetail } from "./results/RoODetail";
import { ResultsActions } from "./results/ResultsActions";
import { calculationsApi } from "@/lib/api/calculations";

// ─── Helpers to extract typed display data from the raw API response ──────────

type CostItem = { component: string; rate: string; amount_gbp: number; amount_eur: number; amount_usd: number };
type TotalCost = { gbp: number; eur: number; usd: number };
type Warning = { type: "warning" | "info"; title: string; message: string; action?: string };
type RoOData = { qualifies: "yes" | "no" | "uncertain"; confidence: number; tca_rule: string; reasoning: string; recommended_actions: string[] };
type ConfidenceFactor = { factor: string; contribution: number; source: "LIVE" | "STATIC" | "AI" | "CHECKED" | "LIVE 1h cache" };

function num(v: unknown): number { return typeof v === "number" ? v : parseFloat(String(v ?? 0)) || 0; }
function str(v: unknown): string { return v == null ? "" : String(v); }

function extractDisplay(result: Record<string, unknown>) {
  // Confidence
  const confidence = num(result.confidence ?? result.confidence_score ?? result.estimate_confidence ?? 0);

  const rawFactors = (result.confidence_factors ?? result.factors ?? []) as Array<Record<string, unknown>>;
  const factors: ConfidenceFactor[] = rawFactors.map((f) => ({
    factor: str(f.factor ?? f.name ?? f.component),
    contribution: num(f.contribution ?? f.weight ?? f.score),
    source: (str(f.source ?? "LIVE")) as ConfidenceFactor["source"],
  }));

  // Lines / cost breakdown
  const rawLines = (result.lines ?? result.line_items ?? result.cost_breakdown ?? []) as Array<Record<string, unknown>>;
  const breakdown: CostItem[] = rawLines.map((l) => ({
    component: str(l.component ?? l.description ?? l.hs_code ?? l.name ?? "Line item"),
    rate: l.rate != null ? `${l.rate}%` : l.import_duty_rate != null ? `${num(l.import_duty_rate) * 100}%` : "—",
    amount_gbp: num(l.amount_gbp ?? l.total_gbp ?? l.customs_value_gbp ?? l.value_gbp),
    amount_eur: num(l.amount_eur ?? l.total_eur ?? l.value_eur),
    amount_usd: num(l.amount_usd ?? l.total_usd ?? l.value_usd),
  }));

  // Totals
  const t = (result.totals ?? result.total ?? result.summary ?? {}) as Record<string, unknown>;
  const total: TotalCost = {
    gbp: num(t.gbp ?? t.total_gbp ?? t.total_landed_cost_gbp ?? result.total_landed_cost_gbp ?? result.total_gbp),
    eur: num(t.eur ?? t.total_eur ?? t.total_landed_cost_eur ?? result.total_landed_cost_eur),
    usd: num(t.usd ?? t.total_usd ?? t.total_landed_cost_usd ?? result.total_landed_cost_usd),
  };

  // Warnings
  const rawWarnings = (result.warnings ?? result.issues ?? result.alerts ?? []) as Array<Record<string, unknown>>;
  const warnings: Warning[] = rawWarnings.map((w) => ({
    type: (str(w.type ?? w.severity ?? "info").toLowerCase().includes("warn") ? "warning" : "info") as Warning["type"],
    title: str(w.title ?? w.code ?? w.name ?? "Notice"),
    message: str(w.message ?? w.detail ?? w.description ?? ""),
    action: w.action ? str(w.action) : undefined,
  }));

  // RoO
  const rooRaw = (result.roo ?? result.rules_of_origin ?? result.origin_analysis) as Record<string, unknown> | undefined;
  const roo: RoOData | null = rooRaw
    ? {
        qualifies: (str(rooRaw.qualifies ?? rooRaw.status ?? rooRaw.result ?? "uncertain").toLowerCase() as RoOData["qualifies"]),
        confidence: num(rooRaw.confidence ?? rooRaw.confidence_score),
        tca_rule: str(rooRaw.tca_rule ?? rooRaw.rule ?? rooRaw.applicable_rule ?? "—"),
        reasoning: str(rooRaw.reasoning ?? rooRaw.explanation ?? rooRaw.notes ?? ""),
        recommended_actions: Array.isArray(rooRaw.recommended_actions)
          ? (rooRaw.recommended_actions as unknown[]).map(str)
          : [],
      }
    : null;

  return { confidence, factors, breakdown, total, warnings, roo };
}

// ─── Dummy data shown before first calculation ───────────────────────────────

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
  { component: "Freight (CIF add.)", rate: "—", amount_gbp: 0, amount_eur: 0, amount_usd: 0 },
  { component: "Anti-Dumping", rate: "0%", amount_gbp: 0, amount_eur: 0, amount_usd: 0 },
];

const DUMMY_TOTAL: TotalCost = { gbp: 2508, eur: 2934.36, usd: 3260.4 };

const DUMMY_WARNINGS: Warning[] = [
  {
    type: "warning",
    title: "Rules of Origin — Preferential Rate NOT Applied",
    message: "This product may not qualify for the UK-EU TCA 0% preferential duty rate. Standard MFN rate of 4.5% has been applied.",
    action: "View RoO Details",
  },
  {
    type: "info",
    title: "Destination VAT Rate Estimated",
    message: "The VAT rate for the destination country is an estimate based on standard rates and may vary.",
  },
];

const DUMMY_ROO: RoOData = {
  qualifies: "uncertain",
  confidence: 62,
  tca_rule: "Manufacture from materials of any heading, except from headings 64.01 to 64.05",
  reasoning: "Unable to confirm origin of materials used in manufacture. If materials are sourced from UK/EU, the product likely qualifies. Recommend verification.",
  recommended_actions: [
    "Obtain supplier declaration confirming UK/EU origin of uppers and soles",
    "Consider applying for a Binding Tariff Information (BTI)",
  ],
};

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
          Sample data shown — fill in the form and click Calculate to see real results.
        </div>
      )}

      <ConfidenceMeter confidence={confidence} factors={factors.length ? factors : DUMMY_FACTORS} />
      <CostTable breakdown={breakdown.length ? breakdown : DUMMY_BREAKDOWN} total={total.gbp ? total : DUMMY_TOTAL} />

      {warnings.length > 0 && <WarningCards warnings={warnings} />}

      {roo && <RoODetail roo={roo} />}

      {/* Raw result fallback for unmapped fields */}
      {isReal && (() => {
        const knownKeys = new Set(["request_id","id","confidence","confidence_score","lines","line_items","cost_breakdown","totals","total","summary","warnings","issues","alerts","roo","rules_of_origin","origin_analysis","confidence_factors","factors","status","input","request","created_at"]);
        const extra = Object.entries(result).filter(([k]) => !knownKeys.has(k));
        if (!extra.length) return null;
        return (
          <details className="mb-6 group">
            <summary className="text-xs text-[var(--muted2)] cursor-pointer hover:text-[var(--text)] select-none">
              {extra.length} additional field{extra.length !== 1 ? "s" : ""} ▸
            </summary>
            <pre className="mt-3 p-4 bg-[var(--s2)] border border-[var(--border)] rounded-lg text-xs text-[var(--muted2)] font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(Object.fromEntries(extra), null, 2)}
            </pre>
          </details>
        );
      })()}

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
