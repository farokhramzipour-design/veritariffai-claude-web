"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics";
import type { AnalyticsPipelineRun } from "@/lib/api/analytics";
import { tariffApi } from "@/lib/api/tariff";
import { CountrySelect } from "@/components/dashboard/calculator/CountrySelect";

// ─── Duty Rate Lookup ──────────────────────────────────────────────────────────

type DutyResult = Record<string, unknown>;

function renderDutyValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return v % 1 === 0 ? String(v) : v.toFixed(4);
  return String(v);
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${highlight ? "bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)]" : "bg-[var(--s2)]"}`}>
      <span className="text-[11px] font-mono text-[var(--muted2)] uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-mono font-bold ${highlight ? "text-[var(--cyan)]" : "text-[var(--text)]"}`}>{value}</span>
    </div>
  );
}

function DutyRateLookup() {
  const [hsCode, setHsCode] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DutyResult | null>(null);

  const handleLookup = async () => {
    console.log("[DutyLookup] button clicked", { hsCode, origin, destination });
    if (!hsCode.trim() || !origin || !destination) {
      console.warn("[DutyLookup] validation failed — missing fields");
      setError("Please fill in all three fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      console.log("[DutyLookup] calling API...");
      const raw = (await tariffApi.lookupDutyRate({
        hs_code: hsCode.trim(),
        origin_country: origin,
        destination_country: destination,
      }) as unknown) as Record<string, unknown>;
      console.log("[DutyLookup] raw response:", raw);
      const data = (raw?.data && typeof raw.data === "object" ? raw.data : raw) as DutyResult;
      console.log("[DutyLookup] parsed data:", data);
      setResult(data);
    } catch (e) {
      console.error("[DutyLookup] error:", e);
      setError(e instanceof Error ? e.message : "Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fields to surface prominently
  const HIGHLIGHT_KEYS = ["vat_rate", "duty_rate", "import_duty_rate", "vat", "duty", "total_rate"];
  const LABEL_MAP: Record<string, string> = {
    vat_rate: "VAT Rate",
    vat: "VAT Rate",
    duty_rate: "Duty Rate",
    import_duty_rate: "Import Duty Rate",
    duty: "Duty Rate",
    total_rate: "Total Rate",
    hs_code: "HS Code",
    commodity_code: "Commodity Code",
    description: "Description",
    origin_country: "Origin",
    destination_country: "Destination",
    currency: "Currency",
    measure_type: "Measure Type",
    preferential_rate: "Preferential Rate",
    mfn_rate: "MFN Rate",
    third_country_duty: "Third Country Duty",
  };

  const highlightEntries = result
    ? Object.entries(result).filter(([k]) => HIGHLIGHT_KEYS.includes(k))
    : [];
  const otherEntries = result
    ? Object.entries(result).filter(([k]) => !HIGHLIGHT_KEYS.includes(k) && result[k] !== null && result[k] !== undefined && result[k] !== "")
    : [];

  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-6 space-y-5">
      <div>
        <h2 className="font-display text-base font-bold text-[var(--text)]">Duty Rate Lookup</h2>
        <p className="text-xs text-[var(--muted2)] mt-0.5 font-mono">
          Get VAT and duty rates for any HS code and trade route instantly.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleLookup(); }} noValidate>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">HS Code</label>
            <input
              value={hsCode}
              onChange={(e) => setHsCode(e.target.value)}
              placeholder="e.g. 8415900099"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">Origin Country</label>
            <CountrySelect value={origin} onValueChange={setOrigin} />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">Destination Country</label>
            <CountrySelect value={destination} onValueChange={setDestination} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--cyan)] text-black font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? "Looking up…" : "Lookup Rates"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {result && (
        <div className="space-y-2 pt-1">
          {/* Highlighted rate fields */}
          {highlightEntries.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-2">
              {highlightEntries.map(([k, v]) => (
                <ResultRow
                  key={k}
                  label={LABEL_MAP[k] ?? k.replace(/_/g, " ")}
                  value={renderDutyValue(v)}
                  highlight
                />
              ))}
            </div>
          )}

          {/* Remaining fields */}
          {otherEntries.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {otherEntries.map(([k, v]) => (
                <ResultRow
                  key={k}
                  label={LABEL_MAP[k] ?? k.replace(/_/g, " ")}
                  value={typeof v === "object" ? JSON.stringify(v) : renderDutyValue(v)}
                />
              ))}
            </div>
          )}

          {highlightEntries.length === 0 && otherEntries.length === 0 && (
            <p className="text-xs text-[var(--muted2)] font-mono text-center py-4">No rate data returned for this combination.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
  <div className="bg-[var(--s1)] p-6 rounded-xl border border-[var(--border)]">
    <p className="text-xs font-mono text-[var(--muted2)] uppercase tracking-wider">{title}</p>
    <p className="text-3xl font-bold font-display mt-2">{value}</p>
    <p className="text-sm text-[var(--muted2)] mt-1">{subtitle}</p>
  </div>
);

function formatMaybeDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function statusClasses(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "success") return "border-green-500/30 text-green-400 bg-green-500/10";
  if (s === "running") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  if (s === "failed" || s === "error") return "border-red-500/30 text-red-400 bg-red-500/10";
  return "border-[var(--border)] text-[var(--muted2)] bg-[var(--s2)]";
}

export default function DashboardPage() {
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof analyticsApi.getKpis>>["data"] | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setKpisLoading(true);
        setKpisError(null);
        const res = await analyticsApi.getKpis();
        if (!isMounted) return;
        setKpis(res.data);
      } catch (e) {
        if (!isMounted) return;
        setKpisError(e instanceof Error ? e.message : "Failed to load KPIs.");
        setKpis(null);
      } finally {
        if (!isMounted) return;
        setKpisLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatted = useMemo(() => {
    if (!kpis) {
      return {
        totalCalculatedValue: kpisLoading ? "…" : "—",
        totalCalculatedSubtitle: kpisLoading ? "loading…" : "across — calcs",
        avgConfidenceValue: kpisLoading ? "…" : "—",
        avgConfidenceSubtitle: kpisLoading ? "loading…" : "across all runs",
        thisMonthValue: kpisLoading ? "…" : "—",
        thisMonthSubtitle: kpisLoading ? "loading…" : "vs last month",
        tariff: null as null | { hsCodes: number; measures: number; vatRates: number },
        latestRuns: null as null | Record<string, AnalyticsPipelineRun>,
      };
    }

    const isV2 = typeof (kpis as any).dashboard === "object" && (kpis as any).dashboard !== null;

    const totalCalculated = isV2 ? (kpis as any).dashboard.total_calculated : (kpis as any).total_calculated;
    const thisMonth = isV2 ? (kpis as any).dashboard.this_month : (kpis as any).this_month;
    const avgConfidencePct = isV2 ? (kpis as any).dashboard.avg_confidence?.pct : (kpis as any).avg_confidence_pct;
    const tariff = isV2 ? (kpis as any).tariff : null;
    const latestRuns = isV2 ? ((kpis as any).pipeline?.latest_runs as unknown) : null;

    const amountNumber = Number(totalCalculated?.amount);
    const currency = (totalCalculated?.currency as string | undefined) || "GBP";
    const display = typeof totalCalculated?.display === "string" ? (totalCalculated.display as string) : null;

    const totalCalculatedValue =
      Number.isFinite(amountNumber)
        ? (amountNumber < 1000 && display
            ? display
            : new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency,
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(amountNumber))
        : "—";

    const calcCount =
      typeof totalCalculated?.calc_count === "number"
        ? (totalCalculated.calc_count as number)
        : typeof totalCalculated?.calcs === "number"
          ? (totalCalculated.calcs as number)
          : 0;
    const totalCalculatedSubtitle = `across ${new Intl.NumberFormat("en-GB").format(calcCount)} calcs`;

    const avgConfidenceValue = Number.isFinite(avgConfidencePct)
      ? `${Math.round(avgConfidencePct)}%`
      : "—";

    const monthCount =
      typeof thisMonth?.count === "number"
        ? (thisMonth.count as number)
        : typeof thisMonth?.calcs === "number"
          ? (thisMonth.calcs as number)
          : 0;
    const thisMonthValue = `${new Intl.NumberFormat("en-GB").format(monthCount)} calcs`;
    const delta = (thisMonth?.delta_vs_last_month as number | undefined) ?? 0;
    const deltaAbs = Math.abs(delta);
    const deltaText =
      delta === 0
        ? "—"
        : `${delta > 0 ? "↑" : "↓"} ${new Intl.NumberFormat("en-GB").format(deltaAbs)}`;
    const thisMonthSubtitle = `${deltaText} vs last month`;

    return {
      totalCalculatedValue,
      totalCalculatedSubtitle,
      avgConfidenceValue,
      avgConfidenceSubtitle: "across all runs",
      thisMonthValue,
      thisMonthSubtitle,
      tariff: tariff
        ? {
            hsCodes: Number(tariff.hs_codes) || 0,
            measures: Number(tariff.measures) || 0,
            vatRates: Number(tariff.vat_rates) || 0,
          }
        : null,
      latestRuns: latestRuns && typeof latestRuns === "object" ? (latestRuns as Record<string, AnalyticsPipelineRun>) : null,
    };
  }, [kpis, kpisLoading]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <Link
          href="/calculator"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--cyan)] text-black font-bold text-sm hover:opacity-90 transition-opacity"
        >
          + New Calculation <ChevronRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      {kpisError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono">
          <AlertCircle size={14} /> {kpisError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Calculated" value={formatted.totalCalculatedValue} subtitle={formatted.totalCalculatedSubtitle} />
        <StatCard title="Avg Confidence" value={formatted.avgConfidenceValue} subtitle={formatted.avgConfidenceSubtitle} />
        <StatCard title="This Month" value={formatted.thisMonthValue} subtitle={formatted.thisMonthSubtitle} />
      </div>

      {(formatted.tariff || formatted.latestRuns) && (
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          {formatted.tariff && (
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text)]">Tariff Dataset</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <ResultRow label="HS Codes" value={new Intl.NumberFormat("en-GB").format(formatted.tariff.hsCodes)} />
                <ResultRow label="Measures" value={new Intl.NumberFormat("en-GB").format(formatted.tariff.measures)} />
                <ResultRow label="VAT Rates" value={new Intl.NumberFormat("en-GB").format(formatted.tariff.vatRates)} />
              </div>
            </div>
          )}

          {formatted.latestRuns && (
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text)]">Pipeline Latest Runs</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(formatted.latestRuns).map(([name, run]) => (
                  <div key={name} className="bg-[var(--s2)] border border-[var(--border)] rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--text)]">{name}</span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${statusClasses(run.status)}`}>
                        {run.status ?? "unknown"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <ResultRow label="Records" value={run.records_processed == null ? "—" : new Intl.NumberFormat("en-GB").format(run.records_processed)} />
                      <ResultRow label="Started" value={formatMaybeDate(run.started_at)} />
                      <ResultRow label="Completed" value={formatMaybeDate(run.completed_at)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Duty Rate Lookup */}
      <DutyRateLookup />
    </div>
  );
}
