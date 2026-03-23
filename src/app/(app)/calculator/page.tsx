"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, Upload, FileText, X, Loader2, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculatorPanel } from "@/components/dashboard/CalculatorPanel";
import { ResultsPanel, AiResultPanel } from "@/components/dashboard/ResultsPanel";
import { calculationsApi } from "@/lib/api/calculations";
import { tariffApi } from "@/lib/api/tariff";
import { invoiceApi } from "@/lib/api/invoice";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";

// Country name → ISO-2 map (shared between sessionStorage pre-fill and inline upload)
const COUNTRY_MAP: Record<string, string> = {
  "united kingdom": "GB", "uk": "GB", "great britain": "GB",
  "united states": "US", "usa": "US", "us": "US",
  "germany": "DE", "france": "FR", "italy": "IT", "spain": "ES",
  "netherlands": "NL", "belgium": "BE", "poland": "PL", "sweden": "SE",
  "denmark": "DK", "norway": "NO", "finland": "FI", "austria": "AT",
  "switzerland": "CH", "portugal": "PT", "ireland": "IE", "czech republic": "CZ",
  "hungary": "HU", "romania": "RO", "bulgaria": "BG", "greece": "GR",
  "croatia": "HR", "slovakia": "SK", "slovenia": "SI", "estonia": "EE",
  "latvia": "LV", "lithuania": "LT", "luxembourg": "LU", "malta": "MT",
  "cyprus": "CY",
  "china": "CN", "japan": "JP", "south korea": "KR", "korea": "KR",
  "india": "IN", "vietnam": "VN", "thailand": "TH", "indonesia": "ID",
  "malaysia": "MY", "singapore": "SG", "taiwan": "TW", "hong kong": "HK",
  "bangladesh": "BD", "pakistan": "PK",
  "canada": "CA", "mexico": "MX", "brazil": "BR", "argentina": "AR",
  "chile": "CL", "colombia": "CO",
  "australia": "AU", "new zealand": "NZ",
  "south africa": "ZA", "nigeria": "NG", "kenya": "KE", "ghana": "GH",
  "egypt": "EG", "morocco": "MA", "ethiopia": "ET",
  "turkey": "TR", "saudi arabia": "SA", "uae": "AE",
  "united arab emirates": "AE", "israel": "IL", "qatar": "QA",
  "kuwait": "KW", "bahrain": "BH", "oman": "OM",
};

function toISO(v: unknown): string | null {
  if (!v || typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return COUNTRY_MAP[trimmed.toLowerCase()] ?? trimmed;
}

// Maps full/partial names → code (covers what AI invoice parsers typically return)
const INCOTERM_NAME_MAP: Record<string, string> = {
  "EX WORKS": "EXW", "EXWORKS": "EXW",
  "FREE CARRIER": "FCA",
  "FREE ALONGSIDE SHIP": "FAS", "FREE ALONGSIDE": "FAS",
  "FREE ON BOARD": "FOB",
  "COST AND FREIGHT": "CFR", "COST & FREIGHT": "CFR",
  "COST INSURANCE FREIGHT": "CIF", "COST, INSURANCE AND FREIGHT": "CIF",
  "COST, INSURANCE & FREIGHT": "CIF",
  "CARRIAGE PAID TO": "CPT",
  "CARRIAGE AND INSURANCE PAID": "CIP", "CARRIAGE & INSURANCE PAID": "CIP",
  "DELIVERED AT PLACE": "DAP",
  "DELIVERED AT PLACE UNLOADED": "DPU", "DELIVERED AT TERMINAL": "DPU",
  "DELIVERED DUTY PAID": "DDP",
};
const VALID_INCOTERM_CODES = ["EXW","FCA","FAS","FOB","CFR","CIF","CPT","CIP","DAP","DPU","DDP"];

function normalizeIncoterm(v: unknown): string | null {
  if (!v || typeof v !== "string") return null;
  const upper = v.trim().toUpperCase();
  // 1. Exact code match
  if (VALID_INCOTERM_CODES.includes(upper)) return upper;
  // 2. Starts with a code followed by space, dash, or slash (e.g. "CIF - Cost...")
  for (const code of VALID_INCOTERM_CODES) {
    if (upper.startsWith(code + " ") || upper.startsWith(code + "-") || upper.startsWith(code + "/")) return code;
  }
  // 3. Code wrapped in parens (e.g. "Free on Board (FOB)")
  const parenMatch = upper.match(/\(([A-Z]{3})\)/);
  if (parenMatch && VALID_INCOTERM_CODES.includes(parenMatch[1])) return parenMatch[1];
  // 4. Full name match
  if (INCOTERM_NAME_MAP[upper]) return INCOTERM_NAME_MAP[upper];
  // 5. Partial name — check if any key is contained in the value
  for (const [name, code] of Object.entries(INCOTERM_NAME_MAP)) {
    if (upper.includes(name)) return code;
  }
  return null;
}

function applyInvoiceData(
  data: Record<string, unknown>,
  setStep1: (v: Record<string, unknown>) => void,
  updateLine: (i: number, v: Record<string, unknown>) => void,
  addLine: () => void,
  reset: () => void,
  setAdvanced: (v: { freightCost?: { amount: string; currency: string } | null; insuranceCost?: { amount: string; currency: string } | null }) => void,
) {
  const origin = toISO(data.origin_country ?? data.country_of_origin);
  const dest = toISO(data.destination ?? data.destination_country);
  const incoterm = normalizeIncoterm(data.incoterms ?? data.incoterm ?? data.terms_of_delivery ?? data.delivery_terms);
  const currency = String(data.currency ?? "GBP");
  const invoiceLines = (data.line_items ?? data.lines ?? data.items) as unknown[] | undefined;
  const freightRaw = data.freight_cost ?? data.freight ?? data.freight_value;
  const insuranceRaw = data.insurance_value ?? data.insurance ?? data.insurance_cost;

  if (Array.isArray(invoiceLines) && invoiceLines.length > 0) {
    reset(); // reset first, then apply — so values aren't wiped
    const step1Patch: Record<string, unknown> = {};
    if (origin) step1Patch.originCountry = origin;
    if (dest) step1Patch.destinationCountry = dest;
    if (incoterm) step1Patch.incoterm = incoterm;
    if (Object.keys(step1Patch).length) setStep1(step1Patch);
    if (freightRaw != null) setAdvanced({ freightCost: { amount: String(freightRaw), currency } });
    if (insuranceRaw != null) setAdvanced({ insuranceCost: { amount: String(insuranceRaw), currency } });
    invoiceLines.forEach((item, i) => {
      const line = item as Record<string, unknown>;
      if (i > 0) addLine();
      updateLine(i, {
        hs_code: String(line.hs_code ?? line.commodity_code ?? ""),
        description: String(line.description ?? line.goods_description ?? ""),
        value: (() => {
          // Prefer total/CIF value over unit price
          const v = line.customs_value ?? line.cif_value ?? line.total_price ?? line.total_value ?? line.amount ?? line.value;
          return v != null ? String(v) : "";
        })(),
        currency: String(line.currency ?? currency),
      });
    });
  } else {
    const step1Patch: Record<string, unknown> = {};
    if (origin) step1Patch.originCountry = origin;
    if (dest) step1Patch.destinationCountry = dest;
    if (incoterm) step1Patch.incoterm = incoterm;
    if (Object.keys(step1Patch).length) setStep1(step1Patch);
    if (freightRaw != null) setAdvanced({ freightCost: { amount: String(freightRaw), currency } });
    if (insuranceRaw != null) setAdvanced({ insuranceCost: { amount: String(insuranceRaw), currency } });
    updateLine(0, {
      hs_code: String(data.hs_code ?? data.commodity_code ?? ""),
      description: String(data.description ?? data.goods_description ?? ""),
      value: (data.invoice_value ?? data.total_value) ? String(data.invoice_value ?? data.total_value) : "",
      currency,
    });
  }
}

// ─── Inline invoice upload zone ───────────────────────────────────────────────

function InvoiceUploadZone({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { setStep1, updateLine, addLine, reset, setAdvanced } = useCalculatorStore();

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const raw = (await invoiceApi.upload(file) as unknown) as Record<string, unknown>;
      const data = (raw.data && typeof raw.data === "object" ? raw.data : raw) as Record<string, unknown>;
      applyInvoiceData(data, setStep1 as (v: Record<string, unknown>) => void, updateLine as (i: number, v: Record<string, unknown>) => void, addLine, reset, setAdvanced);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragOver ? "border-[var(--cyan)] bg-[rgba(0,229,255,0.05)]" : "border-[var(--border)] hover:border-[rgba(0,229,255,0.4)] hover:bg-[rgba(0,229,255,0.02)]"}
          ${file ? "border-[rgba(0,229,255,0.4)]" : ""}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="p-8 flex flex-col items-center text-center gap-3">
          {file ? (
            <FileText size={32} className="text-[var(--cyan)]" />
          ) : (
            <Upload size={32} className="text-[var(--muted2)]" />
          )}
          {file ? (
            <div>
              <p className="font-mono text-sm font-bold text-[var(--cyan)]">{file.name}</p>
              <p className="font-mono text-xs text-[var(--muted2)] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-sm font-semibold text-[var(--text)]">
                {dragOver ? "Drop PDF here" : "Drag & drop your invoice PDF"}
              </p>
              <p className="font-mono text-xs text-[var(--muted2)] mt-1">or click to browse — PDF only</p>
            </div>
          )}
          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {file && (
          <>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--cyan)] text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {uploading
                ? <><Loader2 size={15} className="animate-spin" /> Extracting…</>
                : <><Upload size={15} /> Upload &amp; Auto-fill</>
              }
            </button>
            <button
              onClick={() => { setFile(null); setError(""); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
            >
              <X size={14} /> Clear
            </button>
          </>
        )}
        {!file && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--cyan)] text-[var(--cyan)] font-semibold text-sm hover:bg-[rgba(0,229,255,0.05)] transition-colors"
          >
            <Upload size={15} /> Choose PDF
          </button>
        )}
      </div>

      <p className="text-[10px] font-mono text-[var(--muted2)]">
        AI extracts seller, buyer, HS codes, values, countries and pre-fills the calculator automatically.
      </p>
    </div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────

const CalculatorInner = () => {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"manual" | "invoice">("manual");
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<Record<string, unknown> | null>(null);
  const [calcRequestId, setCalcRequestId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [invoiceBanner, setInvoiceBanner] = useState(false);

  const { originCountry, destinationCountry, lines, freightCost, insuranceCost, incoterm, setStep1, updateLine, addLine, reset, setAdvanced } =
    useCalculatorStore();

  // Pre-fill from sessionStorage when navigated from invoice page
  useEffect(() => {
    if (searchParams?.get("from") !== "invoice") return;
    try {
      const raw = sessionStorage.getItem("invoiceData");
      if (!raw) return;
      sessionStorage.removeItem("invoiceData");
      const data = JSON.parse(raw) as Record<string, unknown>;
      applyInvoiceData(data, setStep1 as (v: Record<string, unknown>) => void, updateLine as (i: number, v: Record<string, unknown>) => void, addLine, reset, setAdvanced);
      setInvoiceBanner(true);
      setTimeout(() => setInvoiceBanner(false), 5000);
    } catch {
      // ignore bad sessionStorage data
    }
  }, [searchParams, setStep1, updateLine, addLine, reset, setAdvanced]);

  const handleInvoiceSuccess = () => {
    setMode("manual");
    setInvoiceBanner(true);
    setTimeout(() => setInvoiceBanner(false), 5000);
  };

  const handleCalculate = async () => {
    if (!originCountry || !destinationCountry) {
      setErrorMsg("Please set origin and destination countries.");
      return;
    }
    const validLines = lines.filter((l) => l.hs_code);
    if (!validLines.length) {
      setErrorMsg("Please enter at least one HS code.");
      return;
    }

    setIsCalculating(true);
    setErrorMsg("");

    try {
      // CIF = goods value + freight + insurance distributed proportionally across lines
      const freight = parseFloat(freightCost?.amount ?? "0") || 0;
      const insurance = parseFloat(insuranceCost?.amount ?? "0") || 0;
      const surcharge = freight + insurance;
      const lineValues = validLines.map((l) => parseFloat(l.value || "0") || 0);
      const totalGoods = lineValues.reduce((a, b) => a + b, 0);

      const firstLine = validLines[0];
      const firstValue = lineValues[0] || 0;
      const firstShare = totalGoods > 0 ? firstValue / totalGoods : 1;
      const firstCifValue = firstValue + surcharge * firstShare;

      const syncRequest = {
        origin: originCountry,
        destination: destinationCountry,
        lines: validLines.map((l, i) => {
          const goodsVal = lineValues[i];
          const share = totalGoods > 0 ? goodsVal / totalGoods : 1 / validLines.length;
          const cifValue = goodsVal + surcharge * share;
          return {
            hs_code: l.hs_code,
            description: l.description || undefined,
            customs_value: cifValue.toFixed(2),
            currency: l.currency || "GBP",
          };
        }),
      };

      const aiRequest: Parameters<typeof tariffApi.importAnalysis>[0] = {
        product_description: firstLine.description || firstLine.hs_code || "",
        origin_country: originCountry!,
        destination_country: destinationCountry!,
        customs_value: parseFloat(firstCifValue.toFixed(2)),
        currency: firstLine.currency || "GBP",
        ...(freight > 0 && { freight }),
        ...(insurance > 0 && { insurance }),
        quantity: 1,
        ...(incoterm && { incoterms: incoterm }),
      };
      console.log("[AI] importAnalysis request:", aiRequest);

      const [syncRes, aiRes] = await Promise.allSettled([
        calculationsApi.submitSync(syncRequest) as unknown as Promise<Record<string, unknown>>,
        tariffApi.importAnalysis(aiRequest) as unknown as Promise<Record<string, unknown>>,
      ]);

      if (syncRes.status === "fulfilled") {
        const result = syncRes.value;
        const inner = (result?.data ?? result) as Record<string, unknown>;
        setCalcResult(result);
        setCalcRequestId((inner?.request_id ?? null) as string | null);
      } else {
        const err = syncRes.reason;
        const msg = err instanceof Error ? err.message : "Calculation failed.";
        const detail = typeof err === "object" && err !== null && "detail" in err
          ? JSON.stringify((err as Record<string, unknown>).detail)
          : null;
        setErrorMsg(detail ? `${msg} — ${detail}` : msg);
      }

      if (aiRes.status === "fulfilled") {
        console.log("[AI] importAnalysis response:", aiRes.value);
        setAiResult(aiRes.value as Record<string, unknown>);
      } else {
        console.error("[AI] importAnalysis failed:", aiRes.reason);
      }

      if (syncRes.status === "fulfilled" || aiRes.status === "fulfilled") {
        setShowResults(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Calculation failed.";
      setErrorMsg(msg);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNewCalculation = () => {
    setShowResults(false);
    setCalcResult(null);
    setCalcRequestId(null);
    setAiResult(null);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold mb-2">New Calculation</h1>
          <p className="font-mono text-sm text-[var(--muted2)]">
            Estimate landed cost, duties, and taxes for international shipments.
          </p>
        </header>

        {/* Mode switcher */}
        <div className="flex gap-1 mb-6 p-1 bg-[var(--s1)] border border-[var(--border)] rounded-lg w-fit">
          <button
            onClick={() => setMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "manual"
                ? "bg-[var(--cyan)] text-black"
                : "text-[var(--muted2)] hover:text-[var(--text)]"
            }`}
          >
            ✏️ Manual Entry
          </button>
          <button
            onClick={() => setMode("invoice")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "invoice"
                ? "bg-[var(--cyan)] text-black"
                : "text-[var(--muted2)] hover:text-[var(--text)]"
            }`}
          >
            <Upload size={14} /> Upload Invoice
          </button>
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {invoiceBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.25)] rounded-lg text-sm text-[var(--cyan)] font-mono flex items-center gap-2"
            >
              <CheckCircle size={14} className="flex-shrink-0" />
              Calculator pre-filled from your invoice. Review the fields and click Calculate.
            </motion.div>
          )}
        </AnimatePresence>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Invoice upload mode */}
        <AnimatePresence mode="wait">
          {mode === "invoice" && (
            <motion.div
              key="invoice"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 mb-6"
            >
              <div className="mb-6">
                <h2 className="font-display text-base font-bold text-[var(--text)] mb-1">Upload Commercial Invoice</h2>
                <p className="font-mono text-xs text-[var(--muted2)]">
                  AI extracts trade data and pre-fills the calculator — then switch to Manual Entry to review and calculate.
                </p>
              </div>
              <InvoiceUploadZone onSuccess={handleInvoiceSuccess} />
            </motion.div>
          )}

          {/* Manual entry mode */}
          {mode === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Calculator form */}
              <div className={`${showResults ? "max-w-4xl" : "max-w-4xl mx-auto"}`}>
                <CalculatorPanel onCalculate={handleCalculate} isLoading={isCalculating} />
              </div>

              {/* Results — two panels side by side */}
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.35 }}
                    className="mt-8"
                  >
                    {/* Section label */}
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-display text-lg font-bold text-[var(--text)]">Results</h2>
                      <div className="flex-1 h-px bg-[var(--border)]" />
                    </div>

                    <div className="space-y-6">
                      {/* AI Estimation — full width */}
                      {aiResult ? (
                        <AiResultPanel raw={aiResult} />
                      ) : isCalculating ? (
                        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 flex flex-col items-center gap-3 text-[var(--muted2)]">
                          <Loader2 size={24} className="animate-spin" />
                          <p className="font-mono text-sm">Running AI analysis…</p>
                        </div>
                      ) : (
                        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-8 flex flex-col items-center gap-2 text-[var(--muted2)]">
                          <p className="font-mono text-sm text-center">AI estimation unavailable</p>
                          <p className="font-mono text-xs text-center">The AI analysis could not be completed for this shipment.</p>
                        </div>
                      )}

                      {/* Save / full report — keep ResultsPanel but visually minimal */}
                      <ResultsPanel
                        result={calcResult}
                        requestId={calcRequestId}
                        onNewCalculation={handleNewCalculation}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function CalculatorPage() {
  return (
    <Suspense>
      <CalculatorInner />
    </Suspense>
  );
}
