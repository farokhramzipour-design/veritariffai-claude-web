"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, CheckCircle, Copy, Check,
  ChevronDown, ChevronUp, Zap,
} from "lucide-react";
import { ConfidenceMeter } from "./results/ConfidenceMeter";
import { CostTable } from "./results/CostTable";
import { WarningCards } from "./results/WarningCards";
import { ResultsActions } from "./results/ResultsActions";
import { calculationsApi } from "@/lib/api/calculations";

// ─── API response types ───────────────────────────────────────────────────────

interface MoneyAmount { amount: string; currency: string }

interface ApiTotals {
  customs_value?: MoneyAmount;
  total_duty?: MoneyAmount;
  total_vat?: MoneyAmount;
  total_excise?: MoneyAmount;
  total_clearance?: MoneyAmount;
  total_landed_cost?: MoneyAmount;
}

interface ApiLineResult {
  hs_code?: string;
  description?: string;
  duty_rate?: number;
  vat_rate?: number;
  duty_amount?: MoneyAmount;
  vat_amount?: MoneyAmount;
  landed_cost?: MoneyAmount;
  [key: string]: unknown;
}

interface ApiWarning {
  code?: string;
  title?: string;
  message?: string;
  severity?: string;
  type?: string;
  [key: string]: unknown;
}

interface ApiData {
  request_id?: string;
  status?: string;
  confidence_score?: number;
  totals?: ApiTotals;
  line_results?: ApiLineResult[];
  warnings?: ApiWarning[];
  audit_trail_available?: boolean;
  engines_used?: string[];
  [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type CostItem = { component: string; rate: string; amount_gbp: number; amount_eur: number; amount_usd: number };
type TotalCost = { gbp: number; eur: number; usd: number };
type Warning = { type: "warning" | "info"; title: string; message: string; action?: string };
type ConfidenceFactor = { factor: string; contribution: number; source: "LIVE" | "STATIC" | "AI" | "CHECKED" | "LIVE 1h cache" };

function money(m?: MoneyAmount): number {
  return m ? parseFloat(m.amount) || 0 : 0;
}

function pct(rate?: number): string {
  if (rate == null) return "—";
  return `${(rate * (rate <= 1 ? 100 : 1)).toFixed(1)}%`;
}

function unwrap(result: Record<string, unknown>): ApiData {
  // Response shape: { data: ApiData, meta: {...} }
  if (result.data && typeof result.data === "object") return result.data as ApiData;
  return result as ApiData;
}

function buildBreakdown(data: ApiData): CostItem[] {
  const t = data.totals ?? {};
  const rows: Array<{ label: string; rate: string; value?: MoneyAmount }> = [
    { label: "Customs Value",   rate: "—",             value: t.customs_value },
    { label: "Import Duty",     rate: pct(undefined),  value: t.total_duty },
    { label: "Import VAT",      rate: pct(undefined),  value: t.total_vat },
    { label: "Excise Duty",     rate: "—",             value: t.total_excise },
    { label: "Clearance Fees",  rate: "—",             value: t.total_clearance },
  ];

  // If we have line_results, extract rates from first line
  const firstLine = data.line_results?.[0];
  if (firstLine) {
    const dutyRow = rows.find(r => r.label === "Import Duty");
    const vatRow  = rows.find(r => r.label === "Import VAT");
    if (dutyRow && firstLine.duty_rate != null) dutyRow.rate = pct(firstLine.duty_rate as number);
    if (vatRow  && firstLine.vat_rate  != null) vatRow.rate  = pct(firstLine.vat_rate  as number);
  }

  return rows
    .filter(r => money(r.value) > 0 || r.label === "Customs Value")
    .map(r => ({
      component: r.label,
      rate: r.rate,
      amount_gbp: money(r.value),
      amount_eur: 0,
      amount_usd: 0,
    }));
}

// ─── Raw JSON collapsible ─────────────────────────────────────────────────────

function RawResult({ result }: { result: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(result, null, 2);

  return (
    <div className="mb-6 border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--s2)] text-xs font-mono text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
      >
        <span>Raw API response</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">{Object.keys(result).length} keys</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div className="relative">
          <button
            onClick={() => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-[var(--s3)] text-[10px] text-[var(--muted2)] hover:text-[var(--text)] z-10"
          >
            {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
          </button>
          <pre className="p-4 text-xs font-mono text-[var(--muted2)] overflow-x-auto whitespace-pre-wrap bg-[var(--bg)] max-h-80 overflow-y-auto">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
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
  { component: "Customs Value",   rate: "—",    amount_gbp: 2000, amount_eur: 2340, amount_usd: 2600 },
  { component: "Import Duty",     rate: "4.5%", amount_gbp: 90,   amount_eur: 105.3,amount_usd: 117  },
  { component: "Import VAT",      rate: "20%",  amount_gbp: 418,  amount_eur: 489,  amount_usd: 543  },
];
const DUMMY_TOTAL: TotalCost = { gbp: 2508, eur: 2934, usd: 3260 };
const DUMMY_WARNINGS: Warning[] = [{
  type: "warning",
  title: "Rules of Origin — Preferential Rate NOT Applied",
  message: "This product may not qualify for the UK-EU TCA 0% preferential duty rate. Standard MFN rate of 4.5% has been applied.",
}];

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

  // Unwrap and parse the real API response
  const data: ApiData | null = isReal ? unwrap(result) : null;

  const confidence = data ? Math.round((data.confidence_score ?? 0) * 100) : 91;

  const breakdown: CostItem[] = data ? buildBreakdown(data) : DUMMY_BREAKDOWN;
  const total: TotalCost = data
    ? { gbp: money(data.totals?.total_landed_cost), eur: 0, usd: 0 }
    : DUMMY_TOTAL;

  const warnings: Warning[] = data?.warnings?.map(w => ({
    type: (w.severity ?? w.type ?? "info") === "warning" ? "warning" : "info",
    title: w.title ?? w.code ?? "Notice",
    message: w.message ?? "",
  })) ?? (isReal ? [] : DUMMY_WARNINGS);

  const factors: ConfidenceFactor[] = data?.engines_used?.map(e => ({
    factor: e.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    contribution: Math.round(100 / (data.engines_used?.length ?? 1)),
    source: "LIVE" as const,
  })) ?? DUMMY_FACTORS;

  const effectiveRequestId = requestId ?? data?.request_id ?? null;

  const handleSaveProfile = async () => {
    if (!result || !saveName.trim()) return;
    setSaveState("saving");
    try {
      await calculationsApi.createProfile({
        name: saveName.trim(),
        shipment_data: (data ?? {}) as Record<string, unknown>,
        lines_data: (data?.line_results ?? [result]) as Record<string, unknown>[],
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          {isReal ? "Calculation Results" : "Results Preview"}
        </h2>
        {isReal && effectiveRequestId && (
          <button
            onClick={() => router.push(`/calculator/result/${effectiveRequestId}`)}
            className="text-xs text-[var(--cyan)] hover:underline font-mono"
          >
            Full report →
          </button>
        )}
      </div>

      {/* Preview notice */}
      {!isReal && (
        <div className="mb-4 px-3 py-2 bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.15)] rounded text-xs text-[var(--muted2)] font-mono">
          Sample data — fill in origin, destination, and HS code then click Calculate.
        </div>
      )}

      {/* Status + engines badge row */}
      {isReal && data && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono uppercase border ${
            data.status === "complete"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${data.status === "complete" ? "bg-green-400" : "bg-yellow-400"}`} />
            {data.status ?? "processing"}
          </span>
          {data.engines_used?.map(e => (
            <span key={e} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)] text-[var(--cyan)]">
              <Zap size={9} /> {e.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Raw response viewer */}
      {isReal && <RawResult result={result} />}

      {/* Confidence */}
      <ConfidenceMeter confidence={confidence} factors={factors} />

      {/* Cost table */}
      <CostTable breakdown={breakdown} total={total} />

      {/* Warnings */}
      {warnings.length > 0 && <WarningCards warnings={warnings} />}

      {/* Save as profile */}
      {isReal && (
        <div className="mb-6">
          {showSaveForm ? (
            <div className="flex gap-2">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
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
              <button onClick={() => setShowSaveForm(false)} className="px-3 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)]">
                Cancel
              </button>
            </div>
          ) : saveState === "saved" ? (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={14} /> Saved to profiles
            </div>
          ) : (
            <button onClick={() => setShowSaveForm(true)} className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--cyan)] transition-colors">
              <Save size={14} /> Save as profile
            </button>
          )}
        </div>
      )}

      <ResultsActions onNewCalculation={onNewCalculation} />
    </div>
  );
};
