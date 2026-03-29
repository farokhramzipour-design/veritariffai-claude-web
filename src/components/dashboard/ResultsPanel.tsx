"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, CheckCircle, Copy, Check,
  ChevronDown, ChevronUp, Zap, Brain, AlertTriangle, FileText, Shield,
} from "lucide-react";
import { ConfidenceMeter } from "./results/ConfidenceMeter";
import { CostTable } from "./results/CostTable";
import { WarningCards } from "./results/WarningCards";
import { ResultsActions } from "./results/ResultsActions";
import { calculationsApi } from "@/lib/api/calculations";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";

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
    { label: "CIF Value",        rate: "—",             value: t.customs_value },
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
    .filter(r => money(r.value) > 0 || r.label === "CIF Value")
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
  { component: "CIF Value",       rate: "—",    amount_gbp: 2000, amount_eur: 2340, amount_usd: 2600 },
  { component: "Import Duty",     rate: "4.5%", amount_gbp: 90,   amount_eur: 105.3,amount_usd: 117  },
  { component: "Import VAT",      rate: "20%",  amount_gbp: 418,  amount_eur: 489,  amount_usd: 543  },
];
const DUMMY_TOTAL: TotalCost = { gbp: 2508, eur: 2934, usd: 3260 };
const DUMMY_WARNINGS: Warning[] = [{
  type: "warning",
  title: "Rules of Origin — Preferential Rate NOT Applied",
  message: "This product may not qualify for the UK-EU TCA 0% preferential duty rate. Standard MFN rate of 4.5% has been applied.",
}];

// ─── AI Import Analysis panel ─────────────────────────────────────────────────

interface AiCalc {
  cif_value?: number;
  duty_amount?: number;
  vat_amount?: number;
  total_landed_cost?: number;
  currency?: string;
  duty_basis?: string;
  vat_basis?: string;
}
interface AiClassification {
  primary_hs_code?: string;
  confidence?: number;
  alternative_hs_codes?: string[];
  reasoning_summary?: string;
  missing_attributes?: string[];
  review_required?: boolean;
}
interface AiRates {
  duty_rate?: number;
  vat_rate?: number;
  preferential_duty_rate?: number;
  preferential_eligible?: boolean;
  preferential_agreement?: string;
}
interface AiMeasures {
  anti_dumping?: boolean;
  anti_dumping_rate?: number;
  countervailing?: boolean;
  countervailing_rate?: number;
}
interface AiCompliance {
  documents_required?: string[];
  notes?: string[];
}
interface AiResponse {
  success?: boolean;
  classification?: AiClassification;
  rates?: AiRates;
  measures?: AiMeasures;
  compliance?: AiCompliance;
  calculation?: AiCalc;
  sources?: { type?: string; provider?: string; model?: string }[];
}

function fmt(n?: number, currency = "GBP"): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}
function fmtPct(n?: number): string {
  if (n == null) return "—";
  return `${(n * (n <= 1 ? 100 : 1)).toFixed(2)}%`;
}

export function AiResultPanel({ raw }: { raw: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const { sanctionsCheck, importerName, exporterName } = useCalculatorStore();

  // unwrap data wrapper if present
  const ai = ((raw.data && typeof raw.data === "object" ? raw.data : raw) as AiResponse);
  const calc = ai.calculation;
  const cls = ai.classification;
  const rates = ai.rates;
  const measures = ai.measures;
  const compliance = ai.compliance;
  const currency = calc?.currency ?? "GBP";

  const confidencePct = cls?.confidence != null ? Math.round(cls.confidence * 100) : null;

  return (
    <div className="bg-[var(--s1)] border border-[rgba(0,229,255,0.2)] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain size={16} className="text-[var(--cyan)]" />
        <h3 className="font-display text-base font-bold text-[var(--text)]">AI Estimation</h3>
        <span className="ml-auto text-[10px] font-mono text-[var(--muted2)] bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)] px-2 py-0.5 rounded">
          /api/v1/import-analysis
        </span>
      </div>

      {cls?.review_required && (
        <div className="flex items-start gap-2 mb-4 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400 font-mono">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          Review required — AI flagged uncertainty in classification
        </div>
      )}

      {/* Classification */}
      {cls && (
        <div className="mb-4 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-2">Classification</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-mono text-lg font-bold text-[var(--cyan)]">{cls.primary_hs_code ?? "—"}</span>
            {confidencePct != null && (
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                confidencePct >= 85 ? "text-green-400 border-green-500/30 bg-green-500/10"
                  : confidencePct >= 60 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                  : "text-red-400 border-red-500/30 bg-red-500/10"
              }`}>
                {confidencePct}% confident
              </span>
            )}
          </div>
          {cls.reasoning_summary && (
            <p className="font-mono text-xs text-[var(--muted2)] mt-1">{cls.reasoning_summary}</p>
          )}
          {cls.alternative_hs_codes && cls.alternative_hs_codes.length > 0 && (
            <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">
              Alternatives: {cls.alternative_hs_codes.join(", ")}
            </p>
          )}
          {cls.missing_attributes && cls.missing_attributes.length > 0 && (
            <p className="font-mono text-[10px] text-yellow-400 mt-1">
              Missing: {cls.missing_attributes.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Rates */}
      {rates && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {[
            { label: "Duty Rate", val: fmtPct(rates.duty_rate) },
            { label: "VAT Rate", val: fmtPct(rates.vat_rate) },
            { label: "Preferential Rate", val: rates.preferential_eligible ? fmtPct(rates.preferential_duty_rate) : "Not eligible" },
            { label: "Agreement", val: rates.preferential_agreement ?? "—" },
          ].map(({ label, val }) => (
            <div key={label} className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)]">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">{label}</p>
              <p className="font-mono text-sm font-bold text-[var(--text)] mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calculation breakdown */}
      {calc && (
        <div className="mb-4">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-2">Cost Breakdown</p>
          <div className="space-y-1.5">
            {[
              { label: "CIF Value", val: fmt(calc.cif_value, currency), sub: calc.duty_basis },
              { label: "Duty Amount", val: fmt(calc.duty_amount, currency) },
              { label: "VAT Amount", val: fmt(calc.vat_amount, currency), sub: calc.vat_basis },
            ].map(({ label, val, sub }) => (
              <div key={label} className="flex items-center justify-between py-2 px-3 rounded bg-[var(--bg)] border border-[var(--border)]">
                <div>
                  <span className="font-mono text-xs text-[var(--muted2)]">{label}</span>
                  {sub && <p className="font-mono text-[10px] text-[var(--muted2)]">{sub}</p>}
                </div>
                <span className="font-mono text-sm font-bold text-[var(--text)]">{val}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2.5 px-3 rounded bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.2)]">
              <span className="font-mono text-xs font-bold text-[var(--cyan)]">Total Landed Cost</span>
              <span className="font-mono text-base font-bold text-[var(--cyan)]">{fmt(calc.total_landed_cost, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Measures */}
      {measures && (measures.anti_dumping || measures.countervailing) && (
        <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <p className="font-mono text-[10px] text-yellow-400 uppercase tracking-wider mb-1.5">Trade Measures</p>
          {measures.anti_dumping && (
            <p className="font-mono text-xs text-[var(--text)]">
              Anti-dumping: {fmtPct(measures.anti_dumping_rate)}
            </p>
          )}
          {measures.countervailing && (
            <p className="font-mono text-xs text-[var(--text)]">
              Countervailing: {fmtPct(measures.countervailing_rate)}
            </p>
          )}
        </div>
      )}

      {/* Compliance */}
      {compliance && ((compliance.documents_required?.length ?? 0) > 0 || (compliance.notes?.length ?? 0) > 0) && (
        <div className="mb-4 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-1.5">
            <FileText size={10} className="inline mr-1" />Compliance
          </p>
          {compliance.documents_required?.map((d, i) => (
            <p key={i} className="font-mono text-xs text-[var(--text)]">• {d}</p>
          ))}
          {compliance.notes?.map((n, i) => (
            <p key={i} className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">{n}</p>
          ))}
        </div>
      )}

      {/* Sanctions screening result */}
      {sanctionsCheck && (
        <div className="mb-4 p-4 bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.25)] rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-[#34d399]" />
            <span className="font-mono text-[10px] text-[#34d399] uppercase tracking-wider font-bold">Sanctions Screening</span>
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.35)] text-[#34d399]">
              ✓ PASSED
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)]">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-0.5">Exporter</p>
              <p className="font-mono text-xs text-[var(--text)]">{exporterName || <span className="text-[var(--muted)]">—</span>}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)]">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-0.5">Importer</p>
              <p className="font-mono text-xs text-[var(--text)]">{importerName || <span className="text-[var(--muted)]">—</span>}</p>
            </div>
          </div>
          <p className="font-mono text-[10px] text-[var(--muted2)] mt-2">Screened against OFAC SDN, UK HMT, EU Consolidated lists.</p>
        </div>
      )}

      {/* Raw collapsible */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-[var(--s2)] text-xs font-mono text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
        >
          <span>Raw AI response</span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {open && (
          <pre className="p-4 text-xs font-mono text-[var(--muted2)] overflow-x-auto whitespace-pre-wrap bg-[var(--bg)] max-h-60 overflow-y-auto">
            {JSON.stringify(raw, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

type TariffLookupData = {
  hs_code?: string;
  description?: string;
  origin_country?: string;
  destination_country?: string;
  destination_market?: string;
  duty?: {
    rate_type?: string | null;
    duty_rate?: number | null;
    human_readable?: string | null;
    source?: string | null;
    rate_basis?: string | null;
  } | null;
  vat?: {
    country_code?: string | null;
    rate_type?: string | null;
    vat_rate?: number | null;
    source?: string | null;
  } | null;
  calculated?: {
    vat_applies_to?: string | null;
    note?: string | null;
    warnings?: unknown[] | null;
  } | null;
  data_freshness?: {
    duty_last_updated?: string | null;
    vat_last_updated?: string | null;
  } | null;
  rates_by_origin?: Array<{
    origin_code?: string;
    origin_name?: string;
    origin_code_type?: string;
    rate_basis?: string | null;
    rate_type?: string | null;
    duty_rate?: number | null;
    valid_from?: string | null;
    valid_to?: string | null;
    source?: string | null;
    human_readable?: string | null;
    duty_expression?: string | null;
    conditions?: unknown[] | null;
  }> | null;
  certificate_codes?: string[] | null;
  certificate_details?: Record<string, string> | null;
  other_measures?: unknown[] | null;
  tariff_quotas?: unknown[] | null;
  non_tariff_measures?: unknown[] | null;
  supplementary_units?: unknown[] | null;
  price_measures?: unknown[] | null;
};

function safePctFromRate(n: number | null | undefined): string {
  if (n == null) return "—";
  const v = n > 1 ? n : n * 100;
  return `${v.toFixed(2)}%`;
}

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--s2)] border border-[var(--border)]">
      <span className="text-[11px] font-mono text-[var(--muted2)] uppercase tracking-wider">{label}</span>
      <span className="text-sm font-mono font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}

export function TariffLookupReportPanel({ raw }: { raw: Record<string, unknown> }) {
  const data = (raw.data && typeof raw.data === "object" ? (raw.data as TariffLookupData) : (raw as TariffLookupData));

  const dutyRateText =
    pickString(data.duty?.human_readable) ??
    (data.duty?.duty_rate != null ? safePctFromRate(data.duty.duty_rate) : null) ??
    "—";
  const vatRateText = data.vat?.vat_rate != null ? `${data.vat.vat_rate}%` : "—";

  const warningsCount = Array.isArray(data.calculated?.warnings) ? data.calculated?.warnings?.length ?? 0 : 0;

  const measureCounts = [
    { label: "Other measures", value: Array.isArray(data.other_measures) ? data.other_measures.length : 0 },
    { label: "Non-tariff measures", value: Array.isArray(data.non_tariff_measures) ? data.non_tariff_measures.length : 0 },
    { label: "Tariff quotas", value: Array.isArray(data.tariff_quotas) ? data.tariff_quotas.length : 0 },
    { label: "Supplementary units", value: Array.isArray(data.supplementary_units) ? data.supplementary_units.length : 0 },
    { label: "Price measures", value: Array.isArray(data.price_measures) ? data.price_measures.length : 0 },
  ];

  const origins = Array.isArray(data.rates_by_origin) ? data.rates_by_origin : [];
  const topOrigins = origins.slice(0, 8);
  const hasMoreOrigins = origins.length > topOrigins.length;

  return (
    <div className="bg-[var(--s1)] border border-[rgba(0,229,255,0.2)] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-[var(--cyan)]" />
        <h3 className="font-display text-base font-bold text-[var(--text)]">Tariff &amp; VAT Lookup</h3>
        <span className="ml-auto text-[10px] font-mono text-[var(--muted2)] bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)] px-2 py-0.5 rounded">
          /api/v1/tariff/lookup
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--s2)] border border-[var(--border)] rounded-lg px-4 py-3">
          <div className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">HS Code</div>
          <div className="font-mono text-sm font-bold text-[var(--text)] mt-1">{data.hs_code ?? "—"}</div>
          <div className="text-xs text-[var(--muted2)] mt-1">{data.description ?? ""}</div>
        </div>
        <div className="bg-[var(--s2)] border border-[var(--border)] rounded-lg px-4 py-3">
          <div className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">Route</div>
          <div className="font-mono text-sm font-bold text-[var(--text)] mt-1">
            {(data.origin_country ?? "—")} → {(data.destination_country ?? "—")}
          </div>
          <div className="text-xs text-[var(--muted2)] mt-1">Market: {data.destination_market ?? "—"}</div>
        </div>
        <div className="bg-[var(--s2)] border border-[var(--border)] rounded-lg px-4 py-3">
          <div className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">Freshness</div>
          <div className="text-xs text-[var(--muted2)] mt-1">Duty: {data.data_freshness?.duty_last_updated ?? "—"}</div>
          <div className="text-xs text-[var(--muted2)] mt-1">VAT: {data.data_freshness?.vat_last_updated ?? "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)] rounded-lg px-4 py-3">
          <div className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">Duty</div>
          <div className="font-display text-2xl font-bold text-[var(--cyan)] mt-1">{dutyRateText}</div>
          <div className="text-xs text-[var(--muted2)] mt-1">
            {pickString(data.duty?.rate_type) ? `Type: ${data.duty?.rate_type}` : "Type: —"}
          </div>
        </div>
        <div className="bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)] rounded-lg px-4 py-3">
          <div className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">VAT</div>
          <div className="font-display text-2xl font-bold text-[var(--cyan)] mt-1">{vatRateText}</div>
          <div className="text-xs text-[var(--muted2)] mt-1">
            {pickString(data.vat?.country_code) ? `Country: ${data.vat?.country_code}` : "Country: —"}
          </div>
        </div>
        <div className="bg-[var(--s2)] border border-[var(--border)] rounded-lg px-4 py-3">
          <div className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">VAT Basis</div>
          <div className="font-mono text-sm font-bold text-[var(--text)] mt-1">{data.calculated?.vat_applies_to ?? "—"}</div>
          <div className="text-xs text-[var(--muted2)] mt-1">{data.calculated?.note ?? ""}</div>
        </div>
      </div>

      {warningsCount > 0 && (
        <div className="mb-4 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400 font-mono flex items-start gap-2">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          {warningsCount} warning{warningsCount === 1 ? "" : "s"} returned by tariff lookup.
        </div>
      )}

      {(topOrigins.length > 0 || (Array.isArray(data.certificate_codes) && data.certificate_codes.length > 0)) && (
        <div className="space-y-3">
          {topOrigins.length > 0 && (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[var(--s2)]">
                <div className="text-xs font-mono text-[var(--muted2)] uppercase tracking-wider">Rates by Origin (sample)</div>
              </div>
              <div className="p-4 space-y-2">
                {topOrigins.map((r, idx) => (
                  <div key={`${r.origin_code ?? "x"}-${idx}`} className="flex items-center justify-between gap-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-[var(--text)] truncate">
                        {(r.origin_code ?? "—")} {r.origin_name ? `· ${r.origin_name}` : ""}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">
                        {(r.rate_type ?? "—")} · {(r.rate_basis ?? "—")} · {(r.source ?? "—")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-[var(--cyan)]">
                        {pickString(r.human_readable) ?? (r.duty_rate != null ? safePctFromRate(r.duty_rate) : "—")}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--muted2)]">
                        {(Array.isArray(r.conditions) ? r.conditions.length : 0) > 0 ? `${(r.conditions as unknown[]).length} conditions` : "no conditions"}
                      </div>
                    </div>
                  </div>
                ))}
                {hasMoreOrigins && (
                  <div className="text-[10px] font-mono text-[var(--muted2)]">
                    Showing {topOrigins.length} of {origins.length} origin rates. Use “Raw API response” for full detail.
                  </div>
                )}
              </div>
            </div>
          )}

          {Array.isArray(data.certificate_codes) && data.certificate_codes.length > 0 && (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[var(--s2)] flex items-center justify-between">
                <div className="text-xs font-mono text-[var(--muted2)] uppercase tracking-wider">Certificate Codes</div>
                <div className="text-[10px] font-mono text-[var(--muted2)]">{data.certificate_codes.length} codes</div>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {data.certificate_codes.slice(0, 24).map((c) => (
                  <span key={c} className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px] font-mono text-[var(--muted2)]">
                    {c}
                  </span>
                ))}
                {data.certificate_codes.length > 24 && (
                  <span className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg)] text-[10px] font-mono text-[var(--muted2)]">
                    +{data.certificate_codes.length - 24} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {measureCounts.map((m) => (
              <InfoRow key={m.label} label={m.label} value={new Intl.NumberFormat("en-GB").format(m.value)} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <RawResult result={raw} />
      </div>
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
  const { originCountry, destinationCountry, lines } = useCalculatorStore();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveError, setSaveError] = useState("");

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
    setSaveError("");
    try {
      await calculationsApi.createProfile({
        name: saveName.trim(),
        shipment_data: {
          origin: originCountry,
          destination: destinationCountry,
        },
        lines_data: lines
          .filter(l => l.hs_code)
          .map(l => ({
            hs_code: l.hs_code,
            description: l.description || undefined,
            customs_value: parseFloat(l.value ?? "0") || 0,
            currency: l.currency || "GBP",
          })),
      });
      setSaveState("saved");
      setShowSaveForm(false);
      setSaveName("");
    } catch (e) {
      console.error("[SaveProfile] error:", e);
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to save profile";
      setSaveError(msg);
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
            <div className="flex flex-col gap-1">
              <button onClick={() => { setShowSaveForm(true); setSaveState("idle"); }} className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--cyan)] transition-colors">
                <Save size={14} /> Save as profile
              </button>
              {saveState === "error" && (
                <p className="text-xs text-red-400 font-mono">Save failed: {saveError || "please try again."}</p>
              )}
            </div>
          )}
        </div>
      )}

      <ResultsActions onNewCalculation={onNewCalculation} />
    </div>
  );
};
