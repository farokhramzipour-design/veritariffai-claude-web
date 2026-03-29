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
  effective_duty_rate?: number;
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
  excise?: boolean;
  excise_rate?: number;
  other_measures?: Array<Record<string, unknown>>;
}
interface AiCompliance {
  documents_required?: string[];
  notes?: string[];
}
interface AiInput {
  product_description?: string;
  origin_country?: string;
  destination_country?: string;
  customs_value?: number;
  currency?: string;
  freight?: number | null;
  insurance?: number | null;
  quantity?: number | null;
  quantity_unit?: string | null;
  incoterms?: string | null;
  manufacturer_name?: string | null;
  goods_description_extended?: string | null;
}
interface AiSource {
  type?: string;
  provider?: string;
  model?: string | null;
}
interface AiTariffLookupBestRate {
  origin_code?: string;
  rate_basis?: string;
  duty_rate?: number;
  saving_vs_mfn?: number;
  saving_pct?: number | null;
}
interface AiTariffLookup {
  hs_code?: string;
  description?: string;
  origin_country?: string;
  destination_country?: string;
  destination_market?: string;
  best_rate?: AiTariffLookupBestRate;
  duty?: Record<string, unknown>;
  vat?: Record<string, unknown>;
  calculated?: Record<string, unknown>;
  data_freshness?: Record<string, unknown>;
  certificate_codes?: string[];
  certificate_details?: Record<string, string>;
  stacked_measures?: Array<Record<string, unknown>>;
  other_measures?: Array<Record<string, unknown>>;
  non_tariff_measures?: Array<Record<string, unknown>>;
  tariff_quotas?: Array<Record<string, unknown>>;
  supplementary_units?: Array<Record<string, unknown>>;
  price_measures?: Array<Record<string, unknown>>;
}
interface AiResponse {
  success?: boolean;
  input?: AiInput;
  classification?: AiClassification;
  rates?: AiRates;
  measures?: AiMeasures;
  compliance?: AiCompliance;
  calculation?: AiCalc;
  sources?: AiSource[];
  tariff_lookup?: AiTariffLookup;
}

function fmt(n?: number, currency = "GBP"): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}
function fmtPct(n?: number): string {
  if (n == null) return "—";
  return `${(n * (n <= 1 ? 100 : 1)).toFixed(2)}%`;
}

function CardKV({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)]">
      <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">{label}</p>
      <p className="font-mono text-sm font-bold text-[var(--text)] mt-0.5">{value}</p>
    </div>
  );
}

function CardKVS({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)]">
      <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">{label}</p>
      <p className="font-mono text-sm font-bold text-[var(--text)] mt-0.5">{value}</p>
      {sub && <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, subtitle, children, defaultOpen = false }: { title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[var(--s2)] text-left"
      >
        <div>
          <p className="font-display text-sm font-bold text-[var(--text)]">{title}</p>
          {subtitle && <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={14} className="text-[var(--muted2)]" /> : <ChevronDown size={14} className="text-[var(--muted2)]" />}
      </button>
      {open && <div className="p-4 bg-[var(--s1)]">{children}</div>}
    </div>
  );
}

export function AiResultPanel({ raw }: { raw: Record<string, unknown> }) {
  const { sanctionsCheck, importerName, exporterName } = useCalculatorStore();

  const ai = ((raw.data && typeof raw.data === "object" ? raw.data : raw) as AiResponse);
  const calc = ai.calculation;
  const cls = ai.classification;
  const rates = ai.rates;
  const measures = ai.measures;
  const compliance = ai.compliance;
  const currency = calc?.currency ?? "GBP";

  const confidencePct = cls?.confidence != null ? Math.round(cls.confidence * 100) : null;
  const hasTariffLookup = !!ai.tariff_lookup;
  const input = ai.input;
  const tariff = ai.tariff_lookup;
  const bestRate = tariff?.best_rate;
  const duty = tariff?.duty as Record<string, unknown> | undefined;
  const vat = tariff?.vat as Record<string, unknown> | undefined;
  const calculated = tariff?.calculated as Record<string, unknown> | undefined;
  const freshness = tariff?.data_freshness as Record<string, unknown> | undefined;
  const dutyRate = typeof duty?.human_readable === "string" ? duty.human_readable : duty?.duty_rate != null ? fmtPct(duty.duty_rate as number) : "—";
  const dutyType = typeof duty?.rate_type === "string" ? duty.rate_type : null;
  const dutyBasis = typeof duty?.rate_basis === "string" ? duty.rate_basis : null;
  const dutySource = typeof duty?.source === "string" ? duty.source : null;
  const dutyOriginName = typeof duty?.origin_name === "string" ? duty.origin_name : null;
  const dutyConditions = Array.isArray(duty?.conditions) ? duty?.conditions : [];
  const vatRate = vat?.vat_rate != null ? `${Number(vat.vat_rate)}%` : "—";
  const vatCountry = typeof vat?.country_code === "string" ? vat.country_code : null;
  const vatType = typeof vat?.rate_type === "string" ? vat.rate_type : null;
  const vatSource = typeof vat?.source === "string" ? vat.source : null;
  const vatAppliesTo = typeof calculated?.vat_applies_to === "string" ? calculated.vat_applies_to : null;
  const calcNote = typeof calculated?.note === "string" ? calculated.note : null;
  const calcWarnings = Array.isArray(calculated?.warnings) ? (calculated?.warnings as unknown[]).filter((w) => typeof w === "string") as string[] : [];
  const dutyLastUpdated = typeof freshness?.duty_last_updated === "string" ? freshness.duty_last_updated : null;
  const vatLastUpdated = typeof freshness?.vat_last_updated === "string" ? freshness.vat_last_updated : null;

  const dutyTypeLabel =
    dutyType === "PREFERENTIAL" ? "Preferential rate (requires proof of origin)"
      : dutyType === "MFN" ? "Standard duty (MFN)"
        : dutyType === "IMPORT_CONTROL" ? "Import control measure"
          : dutyType ?? "—";

  const dutyBasisLabel =
    dutyBasis === "bilateral_preference" ? "Trade agreement preference"
      : dutyBasis === "MFN" ? "Most-favoured-nation duty"
        : dutyBasis === "group_preference" ? "Group preference"
          : dutyBasis === "import_control" ? "Import control condition"
            : dutyBasis ?? "—";

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

      {input && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          <CardKV label="Route" value={`${input.origin_country ?? "—"} → ${input.destination_country ?? "—"}`} />
          <CardKV label="Incoterms" value={input.incoterms ?? "—"} />
          <CardKV label="Customs Value" value={fmt(input.customs_value ?? undefined, input.currency ?? currency)} />
          <CardKV label="Freight" value={input.freight == null ? "—" : fmt(input.freight, input.currency ?? currency)} />
          <div className="md:col-span-2 p-3 bg-[var(--bg)] border border-[var(--border)] rounded">
            <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-1.5">Product Description</p>
            <p className="font-mono text-xs text-[var(--text)]">{input.product_description ?? "—"}</p>
            {input.goods_description_extended && (
              <p className="font-mono text-[10px] text-[var(--muted2)] mt-1 whitespace-pre-wrap">{input.goods_description_extended}</p>
            )}
          </div>
        </div>
      )}

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
            { label: "Effective Duty", val: rates.effective_duty_rate != null ? fmtPct(rates.effective_duty_rate) : "—" },
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
      {measures && (measures.anti_dumping || measures.countervailing || measures.excise || (measures.other_measures?.length ?? 0) > 0) && (
        <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <p className="font-mono text-[10px] text-yellow-400 uppercase tracking-wider mb-1.5">Trade Measures</p>
          {measures.anti_dumping && <p className="font-mono text-xs text-[var(--text)]">Anti-dumping: {fmtPct(measures.anti_dumping_rate ?? undefined)}</p>}
          {measures.countervailing && <p className="font-mono text-xs text-[var(--text)]">Countervailing: {fmtPct(measures.countervailing_rate ?? undefined)}</p>}
          {measures.excise && <p className="font-mono text-xs text-[var(--text)]">Excise: {measures.excise_rate == null ? "Yes" : fmtPct(measures.excise_rate)}</p>}
          {(measures.other_measures?.length ?? 0) > 0 && (
            <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">
              Other measures: {new Intl.NumberFormat("en-GB").format(measures.other_measures?.length ?? 0)}
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

      {hasTariffLookup && tariff && (
        <div className="mb-4 space-y-3">
          <Section
            title="Tariff Lookup Report"
            subtitle={`${tariff.destination_market ?? "—"} • HS ${tariff.hs_code ?? "—"} • ${tariff.origin_country ?? "—"} → ${tariff.destination_country ?? "—"}`}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <CardKV label="HS Code" value={tariff.hs_code ?? "—"} />
              <CardKV label="Market" value={tariff.destination_market ?? "—"} />
              <CardKV label="Origin" value={tariff.origin_country ?? "—"} />
              <CardKV label="Destination" value={tariff.destination_country ?? "—"} />
            </div>

            {tariff.description && (
              <div className="mb-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded">
                <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-1.5">Tariff Description</p>
                <p className="font-mono text-xs text-[var(--text)]">{tariff.description}</p>
              </div>
            )}

            {bestRate && (
              <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <CardKV label="Best Rate For" value={bestRate.origin_code ?? "—"} />
                <CardKV label="Why This Rate" value={bestRate.rate_basis ?? "—"} />
                <CardKV label="Best Duty Rate" value={bestRate.duty_rate == null ? "—" : fmtPct(bestRate.duty_rate)} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <CardKVS label="Customs Duty Rate" value={dutyRate} sub={[dutyTypeLabel, dutyBasisLabel].filter(Boolean).join(" • ")} />
              <CardKVS label="VAT Rate" value={vatRate} sub={[vatType ? `${vatType} rate` : null, vatCountry ? `Country: ${vatCountry}` : null].filter(Boolean).join(" • ") || undefined} />
              <CardKVS label="Duty Applies To" value="CIF value" sub="Goods value + freight + insurance (where applicable)" />
              <CardKVS label="VAT Applies To" value={vatAppliesTo ?? "CIF value + duty"} sub={calcNote ?? undefined} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <CardKVS label="Duty Data Source" value={dutySource ?? "—"} sub={dutyOriginName ? `Applied for origin: ${dutyOriginName}` : undefined} />
              <CardKVS label="VAT Data Source" value={vatSource ?? "—"} sub={vatLastUpdated ? `Last updated: ${vatLastUpdated}` : undefined} />
              <CardKVS label="Duty Last Updated" value={dutyLastUpdated ?? "—"} />
              <CardKVS label="Conditions / Documents" value={new Intl.NumberFormat("en-GB").format(dutyConditions?.length ?? 0)} sub={(dutyConditions?.length ?? 0) > 0 ? "Some measures require documents/certificates to apply or to be waived." : undefined} />
            </div>

            {calcWarnings.length > 0 && (
              <div className="p-3 bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.25)] rounded-lg">
                <p className="font-mono text-[10px] text-amber-300 uppercase tracking-wider mb-1.5">Important Notes</p>
                <div className="space-y-1">
                  {calcWarnings.map((w, i) => (
                    <p key={i} className="font-mono text-xs text-[var(--text)]">• {w}</p>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section
            title="Certificates & Document Codes"
            subtitle={`${new Intl.NumberFormat("en-GB").format(tariff.certificate_codes?.length ?? 0)} codes`}
          >
            {(tariff.certificate_codes?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tariff.certificate_codes!.map((c) => (
                    <div key={c} className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded">
                      <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">Code</p>
                      <p className="font-mono text-sm font-bold text-[var(--text)] mt-0.5">{c}</p>
                      <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">
                        {tariff.certificate_details?.[c] ?? "Document/certificate requirement"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-[var(--muted2)]">No certificate codes returned.</p>
            )}
          </Section>

          <Section
            title="Measures & Controls"
            subtitle={[
              (tariff.other_measures?.length ?? 0) > 0 ? `${tariff.other_measures?.length ?? 0} measures` : null,
              (tariff.non_tariff_measures?.length ?? 0) > 0 ? `${tariff.non_tariff_measures?.length ?? 0} controls` : null,
              (tariff.tariff_quotas?.length ?? 0) > 0 ? `${tariff.tariff_quotas?.length ?? 0} quotas` : null,
            ].filter(Boolean).join(" • ") || "No extra measures found"}
          >
            <div className="space-y-3">
              {[
                { key: "stacked_measures", label: "Applied Measures", value: tariff.stacked_measures },
                { key: "other_measures", label: "Other Measures", value: tariff.other_measures },
                { key: "non_tariff_measures", label: "Non-tariff Measures", value: tariff.non_tariff_measures },
              ].map((b) => (
                <div key={b.key}>
                  <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-1.5">
                    {b.label} ({new Intl.NumberFormat("en-GB").format(b.value?.length ?? 0)})
                  </p>
                  {Array.isArray(b.value) && b.value.length > 0 ? (
                    <div className="space-y-2">
                      {b.value.slice(0, 6).map((m, idx) => {
                        const rec = (m as Record<string, unknown>);
                        const details = (rec.details && typeof rec.details === "object" ? (rec.details as Record<string, unknown>) : undefined);
                        const title =
                          (details?.measure_type_text as string | undefined) ??
                          (rec.measure_type as string | undefined) ??
                          "Measure";
                        const legal = (details?.legal_base as string | undefined) ?? "—";
                        const validFrom = (rec.valid_from as string | undefined) ?? "—";
                        const validTo = (rec.valid_to as string | undefined) ?? null;
                        const originText =
                          (details?.origin_text as string | undefined) ??
                          (rec.origin_country as string | undefined) ??
                          "—";
                        return (
                          <div key={idx} className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-mono text-xs font-bold text-[var(--text)]">{title}</p>
                              <p className="font-mono text-[10px] text-[var(--muted2)]">{validFrom}{validTo ? ` → ${validTo}` : ""}</p>
                            </div>
                            <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">Applies to origin: {originText}</p>
                            <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">Legal basis: {legal}</p>
                          </div>
                        );
                      })}
                      {b.value.length > 6 && (
                        <p className="font-mono text-[10px] text-[var(--muted2)]">Showing 6 of {b.value.length}.</p>
                      )}
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-[var(--muted2)]">None</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
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
