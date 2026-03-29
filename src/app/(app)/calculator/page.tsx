"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  BookMarked,
  Plus,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculatorPanel } from "@/components/dashboard/CalculatorPanel";
import { AiResultPanel } from "@/components/dashboard/ResultsPanel";
import { calculationsApi } from "@/lib/api/calculations";
import { tariffApi } from "@/lib/api/tariff";
import { invoiceApi } from "@/lib/api/invoice";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";

const AI_RESULT_KEY = "veritariff_ai_result";

interface Profile {
  id?: string;
  profile_id?: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  shipment_data?: Record<string, unknown>;
  lines_data?: Record<string, unknown>[];
  last_result?: Record<string, unknown> | null;
  [key: string]: unknown;
}

function getPid(p: Profile) {
  return (p.id ?? p.profile_id ?? "") as string;
}

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

  if (Array.isArray(invoiceLines) && invoiceLines.length > 0) {
    reset(); // reset first, then apply — so values aren't wiped
    if (exporterName || importerName) {
      setExtractedParties({
        ...(exporterName ? { extractedExporterName: exporterName } : {}),
        ...(importerName ? { extractedImporterName: importerName } : {}),
      });
    }
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
    if (exporterName || importerName) {
      setExtractedParties({
        ...(exporterName ? { extractedExporterName: exporterName } : {}),
        ...(importerName ? { extractedImporterName: importerName } : {}),
      });
    }
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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState("");
  const [view, setView] = useState<"select" | "calculate">("calculate");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  const { originCountry, destinationCountry, lines, freightCost, insuranceCost, incoterm, setStep1, updateLine, addLine, reset, setAdvanced, setExtractedParties } =
    useCalculatorStore();

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

  const locked = showResults && !!aiResult;
  const forceCalculator = searchParams?.get("start") === "1" || searchParams?.get("from") === "invoice";

  const parseProfileItems = (res: unknown): Profile[] => {
    const r = (res && typeof res === "object" ? (res as Record<string, unknown>) : {}) as Record<string, unknown>;
    if (Array.isArray(res)) return res as Profile[];
    if (Array.isArray(r.items)) return r.items as Profile[];
    if (Array.isArray(r.results)) return r.results as Profile[];
    if (Array.isArray(r.profiles)) return r.profiles as Profile[];
    if (Array.isArray(r.data)) return r.data as Profile[];
    if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
      const inner = r.data as Record<string, unknown>;
      return (
        (Array.isArray(inner.items) ? inner.items :
          Array.isArray(inner.results) ? inner.results :
            Array.isArray(inner.profiles) ? inner.profiles :
              []) as Profile[]
      );
    }
    return [];
  };

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError("");
    try {
      const res = await calculationsApi.listProfiles() as unknown;
      setProfiles(parseProfileItems(res));
    } catch (e) {
      setProfilesError(e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to load profiles.");
      setProfiles([]);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  useEffect(() => {
    if (forceCalculator) {
      setView("calculate");
      return;
    }
    if (profilesLoading) {
      setView("select");
      return;
    }
    if (profiles.length > 0) setView("select");
    else setView("calculate");
  }, [forceCalculator, profilesLoading, profiles.length]);

  const resetRunState = () => {
    setShowResults(false);
    setAiResult(null);
    setErrorMsg("");
    setProfileName("");
    setProfileDescription("");
    setProfileDialogOpen(false);
    setMode("manual");
  };

  const handleNewCalculation = () => {
    reset();
    resetRunState();
    if (forceCalculator) setView("calculate");
    else setView(profiles.length > 0 ? "select" : "calculate");
  };

  const handleCreateNewCalculation = () => {
    reset();
    resetRunState();
    setView("calculate");
  };

  const handleStartWorkflowFromProfile = (profile: Profile) => {
    reset();
    resetRunState();

    const sd = profile.shipment_data ?? {};
    const origin = typeof sd.origin === "string" ? sd.origin : null;
    const destination = typeof sd.destination === "string" ? sd.destination : null;
    if (origin) setStep1({ originCountry: origin });
    if (destination) setStep1({ destinationCountry: destination });

    const ld = Array.isArray(profile.lines_data) ? profile.lines_data : [];
    for (let i = 1; i < ld.length; i++) addLine();
    for (let i = 0; i < ld.length; i++) {
      const line = ld[i] ?? {};
      updateLine(i, {
        hs_code: (line.hs_code ?? "") as string,
        description: (line.description ?? "") as string,
        value: line.customs_value != null ? String(line.customs_value) : "",
        currency: (line.currency ?? "GBP") as string,
      });
    }

    setProfileName(profile.name ?? "");
    setProfileDescription((profile.description ?? "") as string);
    setView("calculate");
  };

  const handleShowCalculationResult = (profile: Profile) => {
    if (!profile.last_result) {
      alert("No saved result for this profile yet. Start workflow to run a calculation first.");
      return;
    }
    try { sessionStorage.setItem(AI_RESULT_KEY, JSON.stringify(profile.last_result)); } catch { /* ignore */ }
    router.push("/calculator/result/latest");
  };

  const runImportAnalysis = async (name: string, description: string) => {
    if (!originCountry || !destinationCountry) {
      setErrorMsg("Please set origin and destination countries.");
      return;
    }
    const validLines = lines.filter((l) => l.hs_code);
    if (!validLines.length) {
      setErrorMsg("Please enter at least one HS code.");
      return;
    }

    const freight = parseFloat(freightCost?.amount ?? "0") || 0;
    const insurance = parseFloat(insuranceCost?.amount ?? "0") || 0;
    const firstLine = validLines[0];
    const customsValue = parseFloat(firstLine.value || "0") || 0;
    if (customsValue <= 0) {
      setErrorMsg("Please enter a customs value for the first line item.");
      return;
    }

    setIsCalculating(true);
    setErrorMsg("");

    try {
      const aiRequest: Parameters<typeof tariffApi.importAnalysis>[0] = {
        profile_name: name,
        profile_description: description || undefined,
        product_description: firstLine.description || firstLine.hs_code || "",
        origin_country: originCountry!,
        destination_country: destinationCountry!,
        customs_value: parseFloat(customsValue.toFixed(2)),
        currency: firstLine.currency || "GBP",
        ...(freight > 0 && { freight }),
        ...(insurance > 0 && { insurance }),
        quantity: 1,
        ...(incoterm && { incoterms: incoterm }),
      };

      const aiData = await tariffApi.importAnalysis(aiRequest) as unknown as Record<string, unknown>;
      setAiResult(aiData);
      try { sessionStorage.setItem(AI_RESULT_KEY, JSON.stringify(aiData)); } catch { /* ignore */ }
      setShowResults(true);
      loadProfiles();
    } catch (aiErr) {
      const msg = aiErr instanceof Error ? aiErr.message : typeof aiErr === "string" ? aiErr : "AI analysis failed.";
      setErrorMsg(msg);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculate = async () => {
    if (locked || isCalculating) return;

    if (!originCountry || !destinationCountry) {
      setErrorMsg("Please set origin and destination countries.");
      return;
    }
    const validLines = lines.filter((l) => l.hs_code);
    if (!validLines.length) {
      setErrorMsg("Please enter at least one HS code.");
      return;
    }

    const firstLine = validLines[0];
    const base = (firstLine.description || firstLine.hs_code || "Shipment").trim();
    const corridor = `${originCountry} → ${destinationCountry}`;
    const suggested = `${corridor} · ${base}`.slice(0, 80);

    if (!profileName.trim()) setProfileName(suggested);
    setProfileDialogOpen(true);
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

        {view === "select" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <BookMarked size={18} className="text-[var(--cyan)]" />
                  Profiles
                </h2>
                <p className="font-mono text-xs text-[var(--muted2)] mt-1">
                  Show the last result for a profile, or start a new workflow.
                </p>
              </div>
              <button
                onClick={handleCreateNewCalculation}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cyan)] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> New calculation
              </button>
            </div>

            {profilesError && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                {profilesError}
              </div>
            )}

            {profilesLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 size={28} className="animate-spin text-[var(--cyan)]" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-24 bg-[var(--s1)] border border-[var(--border)] rounded-xl">
                <BookMarked size={40} className="text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted2)] text-sm">No profiles yet.</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Click “New calculation” to create your first one.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {profiles.map((profile, i) => {
                  const pid = getPid(profile);
                  const metaOrigin = (profile.shipment_data?.origin as string | undefined) ?? "";
                  const metaDest = (profile.shipment_data?.destination as string | undefined) ?? "";
                  const metaDate = (profile.updated_at ?? profile.created_at ?? "") as string;
                  return (
                    <motion.div
                      key={pid || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-5 hover:border-[rgba(0,229,255,0.3)] transition-colors"
                    >
                      <div className="mb-3">
                        <h3 className="font-bold text-sm text-[var(--text)] truncate">{profile.name}</h3>
                        {profile.description && (
                          <p className="text-xs text-[var(--muted2)] mt-0.5 line-clamp-2">{profile.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--muted2)] mb-4">
                        {(metaOrigin || metaDest) && (
                          <span>
                            {metaOrigin || "—"}
                            <span className="text-[var(--cyan)] mx-1">→</span>
                            {metaDest || "—"}
                          </span>
                        )}
                        {Array.isArray(profile.lines_data) && (
                          <span>{profile.lines_data.length} line{profile.lines_data.length !== 1 ? "s" : ""}</span>
                        )}
                        <span className="ml-auto">{metaDate ? String(metaDate).slice(0, 10) : "—"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShowCalculationResult(profile)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] text-[var(--cyan)] text-xs font-bold hover:bg-[rgba(0,229,255,0.14)] transition-colors"
                        >
                          <FileText size={14} /> Show result
                        </button>
                        <button
                          onClick={() => handleStartWorkflowFromProfile(profile)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs font-bold hover:border-[rgba(0,229,255,0.35)] transition-colors"
                        >
                          <Zap size={14} /> Start workflow
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === "calculate" && (
          <>
            <div className="flex gap-1 mb-6 p-1 bg-[var(--s1)] border border-[var(--border)] rounded-lg w-fit">
              <button
                onClick={() => setMode("manual")}
                disabled={locked}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === "manual"
                    ? "bg-[var(--cyan)] text-black"
                    : "text-[var(--muted2)] hover:text-[var(--text)]"
                }`}
              >
                ✏️ Manual Entry
              </button>
              <button
                onClick={() => setMode("invoice")}
                disabled={locked}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === "invoice"
                    ? "bg-[var(--cyan)] text-black"
                    : "text-[var(--muted2)] hover:text-[var(--text)]"
                }`}
              >
                <Upload size={14} /> Upload Invoice
              </button>
            </div>

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

              {mode === "manual" && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${showResults ? "max-w-4xl" : "max-w-4xl mx-auto"}`}>
                    <CalculatorPanel onCalculate={handleCalculate} isLoading={isCalculating} isLocked={locked} />
                  </div>

                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.35 }}
                        className="mt-8"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="font-display text-lg font-bold text-[var(--text)]">Results</h2>
                          <div className="flex-1 h-px bg-[var(--border)]" />
                        </div>

                        <div className="space-y-4 max-w-4xl">
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

                          {aiResult && (
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <div className="text-xs font-mono text-[var(--muted2)]">
                                Profile: <span className="text-[var(--text)]">{profileName || "—"}</span>
                              </div>

                              <button
                                onClick={() => router.push("/calculator/result/latest")}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--s1)] border border-[var(--border)] text-sm text-[var(--cyan)] font-mono hover:border-[var(--cyan)] transition-colors"
                              >
                                <FileText size={14} /> Full Report
                              </button>

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
          </>
        )}

        <AnimatePresence>
          {profileDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
              onClick={() => setProfileDialogOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-lg bg-[var(--s1)] border border-[var(--border)] rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                  <div>
                    <h3 className="font-bold text-base">Profile Details</h3>
                    <p className="font-mono text-xs text-[var(--muted2)] mt-0.5">
                      Save this calculation as a profile before running.
                    </p>
                  </div>
                  <button onClick={() => setProfileDialogOpen(false)} className="text-[var(--muted2)] hover:text-[var(--text)]">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">
                      Profile name *
                    </label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Q1 Cotton Trousers Import"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={profileDescription}
                      onChange={(e) => setProfileDescription(e.target.value)}
                      placeholder="Optional notes…"
                      className="w-full min-h-[72px] bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setProfileDialogOpen(false)}
                      className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const n = profileName.trim();
                        if (!n) return;
                        setProfileDialogOpen(false);
                        await runImportAnalysis(n, profileDescription.trim());
                      }}
                      disabled={!profileName.trim() || isCalculating}
                      className="px-5 py-2 rounded-lg bg-[var(--cyan)] text-black font-semibold text-sm disabled:opacity-50"
                    >
                      Run calculation
                    </button>
                  </div>
                </div>
              </motion.div>
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
