"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics";
import type { AnalyticsPipelineRun } from "@/lib/api/analytics";

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${highlight ? "bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)]" : "bg-[var(--s2)]"}`}>
      <span className="text-[11px] font-mono text-[var(--muted2)] uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-mono font-bold ${highlight ? "text-[var(--cyan)]" : "text-[var(--text)]"}`}>{value}</span>
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
    </div>
  );
}
