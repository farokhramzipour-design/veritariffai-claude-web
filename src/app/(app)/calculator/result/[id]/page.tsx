"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { tariffApi } from "@/lib/api/tariff";
import { calculationsApi } from "@/lib/api/calculations";

const AI_RESULT_KEY = "veritariff_ai_result";

type ImportAnalysis = Record<string, unknown>;

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function fmtMoney(value: unknown, currency: string): string {
  const n = typeof value === "object" && value !== null && "amount" in (value as any) ? toNumber((value as any).amount) : toNumber(value);
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

function fmtCompactMoney(value: unknown, currency: string): string {
  const n = typeof value === "object" && value !== null && "amount" in (value as any) ? toNumber((value as any).amount) : toNumber(value);
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function fmtPct(value: unknown): string {
  const n = toNumber(value);
  if (n == null) return "—";
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(pct < 1 ? 2 : 0)}%`;
}

function flagFor(code: string | null | undefined): string {
  switch ((code ?? "").toUpperCase()) {
    case "GB":
      return "🇬🇧";
    case "DE":
      return "🇩🇪";
    case "FR":
      return "🇫🇷";
    case "IT":
      return "🇮🇹";
    case "US":
      return "🇺🇸";
    case "CN":
      return "🇨🇳";
    case "IN":
      return "🇮🇳";
    case "KR":
      return "🇰🇷";
    case "TR":
      return "🇹🇷";
    case "RU":
      return "🇷🇺";
    case "UA":
      return "🇺🇦";
    case "JP":
      return "🇯🇵";
    default:
      return "🌍";
  }
}

function formatDate(date: unknown): string {
  if (typeof date !== "string" || !date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function noteType(note: string): "success" | "info" | "warning" | "danger" {
  const n = note.toLowerCase();
  if (n.includes("sanction") || n.includes("import control") || n.includes("control")) return "warning";
  if (n.includes("preference") || n.includes("origin") || n.includes("psr") || n.includes("statement on origin") || n.includes("rex")) return "info";
  if (n.includes("no anti-dumping") || n.includes("no antidumping") || n.includes("no countervailing")) return "success";
  if (n.includes("hard block") || n.includes("blocked")) return "danger";
  if (n.includes("mfn") || n.includes("third country") || n.includes("walkup")) return "warning";
  return "info";
}

function Alert({ kind, title, children }: { kind: "success" | "info" | "warning" | "danger"; title: string; children: React.ReactNode }) {
  const classes =
    kind === "success"
      ? "bg-green-500/10 border-green-500/30 text-green-300"
      : kind === "danger"
        ? "bg-red-500/10 border-red-500/30 text-red-300"
        : kind === "warning"
          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
          : "bg-[rgba(0,229,255,0.06)] border-[rgba(0,229,255,0.25)] text-[var(--cyan)]";
  return (
    <div className={`border rounded-lg p-4 ${classes}`}>
      <p className="font-mono text-[10px] uppercase tracking-wider font-bold">{title}</p>
      <div className="mt-2 font-mono text-xs text-[var(--text)]">{children}</div>
    </div>
  );
}

function Pill({ tone, children }: { tone: "green" | "red" | "amber" | "blue" | "cyan"; children: React.ReactNode }) {
  const cls =
    tone === "green"
      ? "bg-green-500/10 border-green-500/30 text-green-300"
      : tone === "red"
        ? "bg-red-500/10 border-red-500/30 text-red-300"
        : tone === "amber"
          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
          : tone === "blue"
            ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
            : "bg-[rgba(0,229,255,0.06)] border-[rgba(0,229,255,0.25)] text-[var(--cyan)]";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${cls}`}>{children}</span>;
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-bold text-[var(--text)]">{title}</h2>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function KeyValue({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
      <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">{label}</p>
      <p className="font-mono text-sm font-bold text-[var(--text)] mt-1">{value}</p>
      {sub && <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">{sub}</p>}
    </div>
  );
}

function Report({ data }: { data: ImportAnalysis }) {
  const input = (data.input && typeof data.input === "object" ? (data.input as Record<string, unknown>) : null) ?? null;
  const classification = (data.classification && typeof data.classification === "object" ? (data.classification as Record<string, unknown>) : null) ?? null;
  const rates = (data.rates && typeof data.rates === "object" ? (data.rates as Record<string, unknown>) : null) ?? null;
  const measures = (data.measures && typeof data.measures === "object" ? (data.measures as Record<string, unknown>) : null) ?? null;
  const compliance = (data.compliance && typeof data.compliance === "object" ? (data.compliance as Record<string, unknown>) : null) ?? null;
  const calculation = (data.calculation && typeof data.calculation === "object" ? (data.calculation as Record<string, unknown>) : null) ?? null;
  const tariff = (data.tariff_lookup && typeof data.tariff_lookup === "object" ? (data.tariff_lookup as Record<string, unknown>) : null) ?? null;

  const origin = (input?.origin_country as string | undefined) ?? (tariff?.origin_country as string | undefined) ?? null;
  const destination = (input?.destination_country as string | undefined) ?? (tariff?.destination_country as string | undefined) ?? null;
  const incoterms = (input?.incoterms as string | undefined) ?? null;
  const productDescription = (input?.product_description as string | undefined) ?? "—";
  const currency = (calculation?.currency as string | undefined) ?? (input?.currency as string | undefined) ?? "GBP";
  const hsCode = (classification?.primary_hs_code as string | undefined) ?? (tariff?.hs_code as string | undefined) ?? "—";
  const hsCodePretty = hsCode && hsCode !== "—" ? `${hsCode.slice(0, 4)}.${hsCode.slice(4)}` : "—";

  const confidence = typeof classification?.confidence === "number" ? Math.round((classification.confidence as number) * 100) : null;
  const reviewRequired = Boolean(classification?.review_required);

  const customsValue = input?.customs_value ?? null;
  const freight = input?.freight ?? null;
  const insurance = input?.insurance ?? null;
  const cif = calculation?.cif_value ?? null;
  const dutyAmount = calculation?.duty_amount ?? null;
  const vatAmount = calculation?.vat_amount ?? null;
  const totalLanded = calculation?.total_landed_cost ?? null;

  const dutyRate = rates?.duty_rate ?? null;
  const vatRate = rates?.vat_rate ?? null;
  const prefEligible = Boolean(rates?.preferential_eligible);
  const prefRate = rates?.preferential_duty_rate ?? null;
  const prefAgreement = (rates?.preferential_agreement as string | undefined) ?? null;

  const otherMeasures = Array.isArray(measures?.other_measures) ? (measures?.other_measures as Record<string, unknown>[]) : [];
  const importControlMeasures = otherMeasures.filter((m) => String(m.measure_type ?? "").toUpperCase() === "IMPORT_CONTROL");

  const docsRaw = useMemo(
    () => (Array.isArray(compliance?.documents_required) ? (compliance?.documents_required as unknown[]).filter((x) => typeof x === "string") as string[] : []),
    [compliance]
  );
  const notesRaw = useMemo(
    () => (Array.isArray(compliance?.notes) ? (compliance?.notes as unknown[]).filter((x) => typeof x === "string") as string[] : []),
    [compliance]
  );

  const docs = useMemo(() => {
    const importControl: string[] = [];
    const ukraineControls: string[] = [];
    const originPref: string[] = [];
    const other: string[] = [];
    docsRaw.forEach((d) => {
      if (/^(L-|Y-)\d+/i.test(d)) importControl.push(d);
      else if (/^(U-|N-)\d+/i.test(d)) ukraineControls.push(d);
      else if (/origin|rex|statement/i.test(d)) originPref.push(d);
      else other.push(d);
    });
    return { importControl, ukraineControls, originPref, other };
  }, [docsRaw]);

  const rateRows = useMemo(() => {
    const rows: Array<{
      type: string;
      originLabel: string;
      rate: string;
      basis: string;
      validFrom: string;
      status: string;
      tone: "green" | "blue" | "amber" | "red";
    }> = [];

    const ratesByOrigin = Array.isArray(tariff?.rates_by_origin) ? (tariff?.rates_by_origin as Record<string, unknown>[]) : [];
    ratesByOrigin.forEach((r) => {
      const typeRaw = String(r.rate_type ?? "");
      const originName = String(r.origin_name ?? r.origin_code ?? "—");
      const basisRaw = String(r.rate_basis ?? "");
      const rate = r.human_readable ? String(r.human_readable) : fmtPct(r.duty_rate);
      const validFrom = formatDate(r.valid_from);
      const status = "Active";

      const type =
        typeRaw === "PREFERENTIAL"
          ? "Preferential duty"
          : typeRaw === "MFN"
            ? "Standard duty (MFN)"
            : typeRaw === "IMPORT_CONTROL"
              ? "Import control"
              : typeRaw || "Duty";
      const basis =
        basisRaw === "bilateral_preference"
          ? "Trade agreement"
          : basisRaw === "MFN"
            ? "MFN"
            : basisRaw === "group_preference"
              ? "Preference group"
              : basisRaw === "import_control"
                ? "Conditional measure"
                : basisRaw || "—";

      const tone: "green" | "blue" | "amber" | "red" =
        rate.trim() === "0%" || rate.trim() === "0.000 %" ? "green" : typeRaw === "MFN" ? "blue" : typeRaw === "IMPORT_CONTROL" ? "amber" : "blue";

      rows.push({ type, originLabel: originName, rate, basis, validFrom, status, tone });
    });

    if (vatRate != null) {
      rows.push({
        type: "VAT",
        originLabel: destination ?? "—",
        rate: fmtPct(vatRate),
        basis: "Payable on import",
        validFrom: "—",
        status: "Active",
        tone: "amber",
      });
    }

    return rows;
  }, [tariff, vatRate, destination]);

  const safeguardLandscape = useMemo(() => {
    const matrix = Array.isArray(tariff?.origin_matrix) ? (tariff?.origin_matrix as Record<string, unknown>[]) : [];
    const originIso = (origin ?? "").toUpperCase();
    const now = Date.now();
    const rows: Array<{
      key: string;
      countryLabel: string;
      countryCode: string | null;
      measure: string;
      rate: string;
      orderNo: string;
      validUntil: string;
      appliesLabel: string;
      appliesTone: "green" | "red" | "amber" | "blue" | "cyan";
      rateTone: "green" | "red" | "amber" | "blue" | "cyan";
      rule: string | null;
      expired: boolean;
    }> = [];

    matrix.forEach((entry) => {
      const entryCode = String(entry.origin_code ?? "").toUpperCase();
      const entryName = String((entry.origin_name ?? entryCode) || "—");
      const entryType = String(entry.origin_code_type ?? "");
      const records = Array.isArray(entry.records) ? (entry.records as Record<string, unknown>[]) : [];

      records.forEach((rec) => {
        const mt = String(rec.measure_type ?? "").toUpperCase();
        if (!["SAFEGUARD", "TARIFF_QUOTA", "IMPORT_CONTROL"].includes(mt)) return;

        const details = (rec.details && typeof rec.details === "object" ? (rec.details as Record<string, unknown>) : null) ?? null;
        const originText = (details?.origin_text as string | undefined) ?? null;
        const legalBase = (details?.legal_base as string | undefined) ?? null;
        const orderNo = (details?.order_no as string | undefined) ?? "—";
        const validToRaw = (rec.valid_to as string | undefined) ?? null;
        const validUntil = validToRaw ? formatDate(validToRaw) : "—";
        const expired = mt === "TARIFF_QUOTA" && validToRaw ? new Date(validToRaw).getTime() < now : false;

        const dutyRate = toNumber(rec.duty_rate);
        const dutyText = (details?.duty_text as string | undefined) ?? null;

        const measure =
          mt === "SAFEGUARD"
            ? "Safeguard duty"
            : mt === "TARIFF_QUOTA"
              ? "Tariff quota"
              : "Import control";

        const rate =
          mt === "IMPORT_CONTROL"
            ? (dutyText && dutyText.toLowerCase().includes("prohibit") ? "Prohibited" : "Conditional")
            : dutyRate != null
              ? fmtPct(dutyRate)
              : dutyText ?? "—";

        const rateTone: "green" | "red" | "amber" | "blue" | "cyan" =
          rate.toLowerCase().includes("prohibit")
            ? "red"
            : expired
              ? "amber"
              : dutyRate != null
                ? dutyRate === 0
                  ? "green"
                  : "red"
                : mt === "IMPORT_CONTROL"
                  ? "amber"
                  : "cyan";

        let appliesLabel = "N/A";
        let appliesTone: "green" | "red" | "amber" | "blue" | "cyan" = "blue";
        if (originIso) {
          if (entryCode === originIso) {
            appliesLabel = "Yes";
            appliesTone = "green";
          } else if (entryCode === "5005" && originIso === "GB") {
            appliesLabel = "No — GB exempt via TCA";
            appliesTone = "red";
          } else {
            appliesLabel = `N/A (origin = ${originIso})`;
            appliesTone = "blue";
          }
        }

        const countryLabel =
          entryCode === "5005" && mt === "SAFEGUARD"
            ? "5005 (Safeguard group)"
            : entryCode === "5005" && mt === "TARIFF_QUOTA"
              ? "5005 (Quota)"
              : entryType === "country"
                ? `${flagFor(entryCode)} ${originText ?? entryName}`
                : originText ?? entryName;

        rows.push({
          key: `${entryCode}-${mt}-${String(validToRaw ?? "")}-${String(orderNo)}`,
          countryLabel,
          countryCode: entryType === "country" ? entryCode : null,
          measure,
          rate,
          orderNo: orderNo || "—",
          validUntil,
          appliesLabel,
          appliesTone,
          rateTone,
          rule: legalBase,
          expired,
        });
      });
    });

    const uniq = new Map<string, (typeof rows)[number]>();
    rows.forEach((r) => {
      if (!uniq.has(r.key)) uniq.set(r.key, r);
    });
    return Array.from(uniq.values()).sort((a, b) => a.countryLabel.localeCompare(b.countryLabel));
  }, [tariff, origin]);

  const sources = Array.isArray(data.sources) ? (data.sources as Record<string, unknown>[]) : [];
  const sourceLabel = sources
    .map((s) => String(s.provider ?? s.type ?? "").trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(" · ");

  const dutyRowTone = toNumber(dutyRate) != null && (toNumber(dutyRate) ?? 0) > 0 ? "red" : "gold";

  return (
    <div className="space-y-6">
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="p-8 bg-[rgba(0,229,255,0.06)] border-b border-[rgba(0,229,255,0.15)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-[var(--text)] truncate">{productDescription}</h1>
              <p className="font-mono text-xs text-[var(--muted2)] mt-2">
                Import classification &amp; duty assessment · {origin ?? "—"} → {destination ?? "—"}
              </p>
            </div>
            {confidence != null && (
              <Pill tone={confidence >= 85 ? "green" : confidence >= 60 ? "amber" : "red"}>
                Confidence {confidence}%
              </Pill>
            )}
          </div>

          {reviewRequired && (
            <div className="mt-4">
              <Alert kind="warning" title="Review Recommended">
                The classification confidence is lower than usual or missing key attributes. Please review the HS code and supporting documents.
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-6">
            <KeyValue label="HS Code" value={hsCodePretty} />
            <KeyValue label="Customs Value" value={fmtMoney(customsValue, currency)} />
            <KeyValue label="Freight" value={fmtMoney(freight, currency)} />
            <KeyValue label="CIF Value" value={fmtMoney(cif, currency)} />
            <KeyValue label="Incoterms" value={incoterms ?? "—"} />
            <KeyValue label="Agreement" value={prefEligible ? (prefAgreement ?? "Preferential") : "Standard"} />
          </div>
        </div>
      </div>

      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{flagFor(origin)}</span>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">Origin</p>
              <p className="font-mono text-sm font-bold text-[var(--text)]">{origin ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Pill tone="cyan">{incoterms ?? "Incoterms"}</Pill>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">Destination</p>
              <p className="font-mono text-sm font-bold text-[var(--text)]">{destination ?? "—"}</p>
            </div>
            <span className="text-2xl">{flagFor(destination)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-base font-bold text-[var(--text)]">Total Landed Cost</h2>
            <Pill tone="cyan">{fmtCompactMoney(totalLanded, currency)}</Pill>
          </div>
          <div className="space-y-2">
            <KeyValue label="Goods (Customs Value)" value={fmtMoney(customsValue, currency)} />
            <KeyValue label="Freight" value={fmtMoney(freight, currency)} />
            <KeyValue label="Insurance" value={fmtMoney(insurance, currency)} />
            <div className="h-px bg-[var(--border)] my-2" />
            <KeyValue label="CIF Value" value={fmtMoney(cif, currency)} />
            <KeyValue
              label="Import Duty"
              value={fmtMoney(dutyAmount ?? 0, currency)}
              sub={dutyRate != null ? `Rate: ${fmtPct(dutyRate)}` : undefined}
            />
            <KeyValue label="VAT" value={fmtMoney(vatAmount ?? 0, currency)} sub={vatRate != null ? `Rate: ${fmtPct(vatRate)}` : undefined} />
          </div>
          <div className="mt-4">
            <div className={`p-4 rounded-lg border ${dutyRowTone === "red" ? "border-red-500/30 bg-red-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted2)]">Total</p>
              <p className="font-mono text-xl font-bold text-[var(--text)] mt-1">{fmtMoney(totalLanded, currency)}</p>
              {prefEligible && prefAgreement && (
                <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">Preferential duty available under {prefAgreement}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card
            title="HS Classification"
            right={confidence != null ? <Pill tone={confidence >= 85 ? "green" : confidence >= 60 ? "amber" : "red"}>{confidence}%</Pill> : undefined}
          >
            <div className="grid grid-cols-1 gap-3">
              <KeyValue label="HS Code" value={hsCodePretty} />
              <KeyValue label="Reasoning" value={String(classification?.reasoning_summary ?? "—")} />
              <KeyValue label="Review" value={reviewRequired ? "Recommended" : "Not required"} />
            </div>
          </Card>

          <Card title="Preferential Origin">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <KeyValue label="Eligible" value={prefEligible ? "Yes" : "No"} />
              <KeyValue label="Preferential Duty" value={prefEligible ? fmtPct(prefRate ?? 0) : "—"} />
              <KeyValue label="Standard Duty (MFN)" value={rates?.effective_duty_rate != null ? fmtPct(rates.effective_duty_rate) : "—"} />
              <KeyValue label="Agreement" value={prefAgreement ?? "—"} />
            </div>
          </Card>
        </div>
      </div>

      <Card title="Duty & Tax Rates">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Origin</th>
                <th className="py-2 pr-4">Rate</th>
                <th className="py-2 pr-4">Basis</th>
                <th className="py-2 pr-4">Valid From</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {rateRows.map((r, idx) => (
                <tr key={idx} className="border-t border-[var(--border)]">
                  <td className="py-3 pr-4"><Pill tone={r.tone}>{r.type}</Pill></td>
                  <td className="py-3 pr-4 text-[var(--text)]">{r.originLabel}</td>
                  <td className="py-3 pr-4 font-bold text-[var(--text)]">{r.rate}</td>
                  <td className="py-3 pr-4 text-[var(--muted2)]">{r.basis}</td>
                  <td className="py-3 pr-4 text-[var(--muted2)]">{r.validFrom}</td>
                  <td className="py-3"><Pill tone="blue">{r.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {safeguardLandscape.length > 0 && (
        <Card title="Additional Context — Safeguard Landscape">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">
                  <th className="py-2 pr-4">Country / Group</th>
                  <th className="py-2 pr-4">Measure Type</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4">Order No.</th>
                  <th className="py-2 pr-4">Valid Until</th>
                  <th className="py-2">Applies to origin?</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {safeguardLandscape.map((r) => (
                  <tr key={r.key} className="border-t border-[var(--border)]">
                    <td className="py-3 pr-4 text-[var(--text)]">{r.countryLabel}</td>
                    <td className="py-3 pr-4 text-[var(--text)]">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold">{r.measure}</span>
                        {r.rule && <span className="text-[10px] text-[var(--muted2)]">Rule: {r.rule}</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Pill tone={r.rateTone}>{r.expired ? "Quota expired" : r.rate}</Pill>
                    </td>
                    <td className="py-3 pr-4 text-[var(--muted2)]">{r.orderNo}</td>
                    <td className="py-3 pr-4 text-[var(--muted2)]">{r.validUntil}</td>
                    <td className="py-3">
                      <Pill tone={r.appliesTone}>{r.appliesLabel}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {importControlMeasures.length > 0 && (
            <Alert kind="warning" title="Import Controls">
              Additional import controls may apply to this product. Review the required documents and any conditions before shipping.
              <div className="mt-2 space-y-1">
                {importControlMeasures.slice(0, 3).map((m, i) => (
                  <p key={i} className="font-mono text-[10px] text-[var(--muted2)]">
                    {String((m.details as any)?.legal_base ?? "Legal basis")} · Valid: {formatDate(m.valid_from)} → {typeof m.valid_to === "string" ? formatDate(m.valid_to) : "—"}
                  </p>
                ))}
              </div>
            </Alert>
          )}

          <Card title="Compliance Notes">
            <div className="space-y-3">
              {notesRaw.length > 0 ? (
                notesRaw.map((n, i) => (
                  <Alert key={i} kind={noteType(n)} title="Note">
                    {n}
                  </Alert>
                ))
              ) : (
                <p className="font-mono text-sm text-[var(--muted2)]">No additional compliance notes returned.</p>
              )}
            </div>
          </Card>
        </div>

        <Card title="Documents Required" right={<Pill tone="cyan">{docsRaw.length} items</Pill>}>
          <div className="space-y-5">
            <div>
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-2">Import Control (conditional)</p>
              <div className="flex flex-wrap gap-2">
                {docs.importControl.length > 0 ? docs.importControl.map((d) => <Pill key={d} tone="amber">{d}</Pill>) : <span className="font-mono text-xs text-[var(--muted2)]">None</span>}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-2">Ukraine-related controls</p>
              <div className="flex flex-wrap gap-2">
                {docs.ukraineControls.length > 0 ? docs.ukraineControls.map((d) => <Pill key={d} tone="amber">{d}</Pill>) : <span className="font-mono text-xs text-[var(--muted2)]">None</span>}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-2">Origin &amp; preference</p>
              <div className="flex flex-wrap gap-2">
                {docs.originPref.length > 0 ? docs.originPref.map((d) => <Pill key={d} tone="blue">{d}</Pill>) : <span className="font-mono text-xs text-[var(--muted2)]">None</span>}
              </div>
            </div>
            {docs.other.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-2">Other</p>
                <div className="flex flex-wrap gap-2">
                  {docs.other.map((d) => <Pill key={d} tone="cyan">{d}</Pill>)}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-[var(--s1)] border rounded-xl p-6 ${toNumber(dutyAmount) != null && (toNumber(dutyAmount) ?? 0) > 0 ? "border-red-500/30" : "border-green-500/30"}`}>
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">Import Duty</p>
          <p className="font-mono text-2xl font-bold text-[var(--text)] mt-2">{fmtMoney(dutyAmount ?? 0, currency)}</p>
          <p className="font-mono text-[10px] text-[var(--muted2)] mt-2">{dutyRate != null ? `Rate: ${fmtPct(dutyRate)}` : "Rate: —"}</p>
          {prefEligible && prefAgreement && <div className="mt-2"><Pill tone="green">{prefAgreement}</Pill></div>}
        </div>
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-6">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">VAT</p>
          <p className="font-mono text-2xl font-bold text-[var(--text)] mt-2">{fmtMoney(vatAmount ?? 0, currency)}</p>
          <p className="font-mono text-[10px] text-[var(--muted2)] mt-2">
            {vatRate != null ? `${fmtPct(vatRate)} on CIF value` : "Rate: —"}
          </p>
          <div className="mt-2"><Pill tone="amber">Payable on import</Pill></div>
        </div>
        <div className="bg-[var(--s1)] border border-[rgba(0,229,255,0.25)] rounded-xl p-6">
          <p className="font-mono text-[10px] text-[var(--muted2)] uppercase tracking-wider">Total Landed Cost</p>
          <p className="font-mono text-2xl font-bold text-[var(--cyan)] mt-2">{fmtMoney(totalLanded, currency)}</p>
          <p className="font-mono text-[10px] text-[var(--muted2)] mt-2">Goods + freight + duty + VAT</p>
          <div className="mt-2"><Pill tone="cyan">All-in cost</Pill></div>
        </div>
      </div>

      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="font-mono text-xs text-[var(--muted2)]">
            Data sources: {tariff?.destination_market ? `${String(tariff.destination_market)} tariff` : "tariff databases"} · Rates valid as of {formatDate((tariff?.data_freshness as any)?.duty_last_updated ?? null)}
          </p>
          <p className="font-mono text-xs text-[var(--muted2)]">
            Classification &amp; calculations powered by {sourceLabel || "veritariffai engines"}
          </p>
        </div>
        <p className="font-mono text-[10px] text-[var(--muted2)] mt-3">
          Disclaimer: This report is for cost planning and compliance preparation. Confirm requirements with your customs broker or licensed customs advisor before filing declarations.
        </p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    // "latest" — read the AI result stored in sessionStorage from the calculator page
    if (id === "latest") {
      try {
        const stored = sessionStorage.getItem(AI_RESULT_KEY);
        if (stored) {
          setAiResult(JSON.parse(stored) as Record<string, unknown>);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
      setError("No AI result found. Please run a calculation first.");
      setLoading(false);
      return;
    }

    // Real calculation id — fetch from API and re-run import-analysis
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await calculationsApi.getResult(id) as unknown as Record<string, unknown>;
        const d = (res.data && typeof res.data === "object" ? res.data : res) as Record<string, unknown>;
        const lines = (d.lines ?? d.line_items ?? []) as Record<string, unknown>[];
        const firstLine = lines[0] ?? {};
        const origin = (d.origin ?? d.origin_country ?? "") as string;
        const destination = (d.destination ?? d.destination_country ?? "") as string;
        const description = (firstLine.description ?? d.product_description ?? "") as string;
        const hsCode = (firstLine.hs_code ?? "") as string;
        const customsValue = parseFloat(String(firstLine.customs_value ?? d.customs_value ?? 0)) || 0;
        const currency = (firstLine.currency ?? d.currency ?? "GBP") as string;

        if (origin && destination && (description || hsCode) && customsValue > 0) {
          const ai = await tariffApi.importAnalysis({
            product_description: description || hsCode,
            origin_country: origin,
            destination_country: destination,
            customs_value: customsValue,
            currency,
          }) as unknown as Record<string, unknown>;
          setAiResult(ai);
        } else {
          setError("Not enough data in this calculation to run AI analysis.");
        }
      } catch (e) {
        console.error("[ResultPage] load error:", e);
        setError(e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to load result.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={32} className="animate-spin text-[var(--cyan)]" />
      </div>
    );
  }

  if (error || !aiResult) {
    return (
      <div className="space-y-6 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3 px-4 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold text-sm">Could not load result</p>
            <p className="text-xs mt-0.5">{error || "No AI result available."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-[var(--muted)]">/</span>
        <span className="font-mono text-sm text-[var(--muted2)]">Full Report</span>
      </div>

      <Report data={aiResult} />
    </div>
  );
}
