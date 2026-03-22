"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, AlertCircle, ChevronRight } from "lucide-react";
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
    if (!hsCode.trim() || !origin || !destination) {
      setError("Please fill in all three fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const raw = (await tariffApi.lookupDutyRate({
        hs_code: hsCode.trim(),
        origin_country: origin,
        destination_country: destination,
      }) as unknown) as Record<string, unknown>;
      // unwrap { data: {...} } if present
      const data = (raw?.data && typeof raw.data === "object" ? raw.data : raw) as DutyResult;
      setResult(data);
    } catch (e) {
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

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">HS Code</label>
          <input
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
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
        onClick={handleLookup}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--cyan)] text-black font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        {loading ? "Looking up…" : "Lookup Rates"}
      </button>

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

export default function DashboardPage() {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Calculated" value="£2.3M" subtitle="across 143 calcs" />
        <StatCard title="Avg Confidence" value="91%" subtitle="across all runs" />
        <StatCard title="This Month" value="47 calcs" subtitle="↑ 12 vs last month" />
      </div>

      {/* Duty Rate Lookup */}
      <DutyRateLookup />
    </div>
  );
}
