"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, Upload, FileText, X, Loader2, AlertCircle, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculatorPanel } from "@/components/dashboard/CalculatorPanel";
import { AiResultPanel } from "@/components/dashboard/ResultsPanel";
import { calculationsApi } from "@/lib/api/calculations";
import { tariffApi } from "@/lib/api/tariff";
import { invoiceApi } from "@/lib/api/invoice";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";

const AI_RESULT_KEY = "veritariff_ai_result";

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
  setExtractedParties: (v: { extractedExporterName?: string; extractedImporterName?: string }) => void,
) {
  const origin = toISO(data.origin_country ?? data.country_of_origin);
  const dest = toISO(data.destination ?? data.destination_country);
  const incoterm = normalizeIncoterm(data.incoterms ?? data.incoterm ?? data.terms_of_delivery ?? data.delivery_terms);
  const currency = String(data.currency ?? "GBP");
  const invoiceLines = (data.line_items ?? data.lines ?? data.items) as unknown[] | undefined;
  const freightRaw = data.freight_cost ?? data.freight ?? data.freight_value;
  const insuranceRaw = data.insurance_value ?? data.insurance ?? data.insurance_cost;
  const exporterName =
    (typeof data.exporter_seller_name === "string" && data.exporter_seller_name.trim() ? data.exporter_seller_name.trim() : null) ??
    (typeof (data.seller as any)?.name === "string" && (data.seller as any).name.trim() ? (data.seller as any).name.trim() : null) ??
    (typeof data.exporter_name === "string" && data.exporter_name.trim() ? data.exporter_name.trim() : null) ??
    (typeof data.seller_name === "string" && data.seller_name.trim() ? data.seller_name.trim() : null);
  const importerName =
    (typeof data.importer_buyer_name === "string" && data.importer_buyer_name.trim() ? data.importer_buyer_name.trim() : null) ??
    (typeof (data.buyer as any)?.name === "string" && (data.buyer as any).name.trim() ? (data.buyer as any).name.trim() : null) ??
    (typeof data.importer_name === "string" && data.importer_name.trim() ? data.importer_name.trim() : null) ??
    (typeof data.buyer_name === "string" && data.buyer_name.trim() ? data.buyer_name.trim() : null);

  if (exporterName || importerName) {
    setExtractedParties({
      ...(exporterName ? { extractedExporterName: exporterName } : {}),
      ...(importerName ? { extractedImporterName: importerName } : {}),
    });
  }

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
  const { setStep1, updateLine, addLine, reset, setAdvanced, setExtractedParties } = useCalculatorStore();

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
      applyInvoiceData(
        data,
        setStep1 as (v: Record<string, unknown>) => void,
        updateLine as (i: number, v: Record<string, unknown>) => void,
        addLine,
        reset,
        setAdvanced,
        setExtractedParties
      );
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
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "invoice">("manual");
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [invoiceBanner, setInvoiceBanner] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { originCountry, destinationCountry, lines, freightCost, insuranceCost, incoterm, setStep1, updateLine, addLine, reset, setAdvanced, setExtractedParties } =
    useCalculatorStore();

  const handleSaveProfile = async () => {
    if (!saveName.trim()) return;
    setSaveState("saving");
    setSaveError("");
    try {
      await calculationsApi.createProfile({
        name: saveName.trim(),
        shipment_data: { origin: originCountry, destination: destinationCountry },
        lines_data: lines.filter(l => l.hs_code).map(l => ({
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
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to save";
      setSaveError(msg);
      setSaveState("error");
    }
  };

  // Pre-fill from sessionStorage when navigated from invoice page
  useEffect(() => {
    if (searchParams?.get("from") !== "invoice") return;
    try {
      const raw = sessionStorage.getItem("invoiceData");
      if (!raw) return;
      sessionStorage.removeItem("invoiceData");
      const data = JSON.parse(raw) as Record<string, unknown>;
      applyInvoiceData(
        data,
        setStep1 as (v: Record<string, unknown>) => void,
        updateLine as (i: number, v: Record<string, unknown>) => void,
        addLine,
        reset,
        setAdvanced,
        setExtractedParties
      );
      setInvoiceBanner(true);
      setTimeout(() => setInvoiceBanner(false), 5000);
    } catch {
      // ignore bad sessionStorage data
    }
  }, [searchParams, setStep1, updateLine, addLine, reset, setAdvanced, setExtractedParties]);

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

      try {
        const aiData = await tariffApi.importAnalysis(aiRequest) as unknown as Record<string, unknown>;
        console.log("[AI] importAnalysis response:", aiData);
        setAiResult(aiData);
        try { sessionStorage.setItem(AI_RESULT_KEY, JSON.stringify(aiData)); } catch { /* ignore */ }
        setShowResults(true);
      } catch (aiErr) {
        console.error("[AI] importAnalysis failed:", aiErr);
        const msg = aiErr instanceof Error ? aiErr.message : typeof aiErr === "string" ? aiErr : "AI analysis failed.";
        setErrorMsg(msg);
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
    setAiResult(null);
    setErrorMsg("");
    setSaveState("idle");
    setShowSaveForm(false);
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

                    <div className="space-y-4 max-w-4xl">
                      {/* AI Estimation */}
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

                      {/* Action bar */}
                      {aiResult && (
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {/* Full report */}
                          <button
                            onClick={() => router.push("/calculator/result/latest")}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--s1)] border border-[var(--border)] text-sm text-[var(--cyan)] font-mono hover:border-[var(--cyan)] transition-colors"
                          >
                            <FileText size={14} /> Full Report
                          </button>

                          {/* Save as profile */}
                          {showSaveForm ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                value={saveName}
                                onChange={e => setSaveName(e.target.value)}
                                placeholder="Profile name…"
                                className="flex-1 min-w-0 bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
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
                            <span className="flex items-center gap-2 text-sm text-green-400 font-mono">
                              <CheckCircle size={14} /> Saved to profiles
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <button onClick={() => { setShowSaveForm(true); setSaveState("idle"); }} className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--cyan)] font-mono transition-colors">
                                <Save size={14} /> Save as profile
                              </button>
                              {saveState === "error" && (
                                <p className="text-xs text-red-400 font-mono">Save failed: {saveError || "please try again."}</p>
                              )}
                            </div>
                          )}

                          {/* New calculation */}
                          <button onClick={handleNewCalculation} className="ml-auto text-sm text-[var(--muted2)] hover:text-[var(--text)] font-mono transition-colors">
                            ← New calculation
                          </button>
                        </div>
                      )}
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
