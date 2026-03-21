"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculatorPanel } from "@/components/dashboard/CalculatorPanel";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";
import { calculationsApi } from "@/lib/api/calculations";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";

const CalculatorInner = () => {
  const searchParams = useSearchParams();
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<Record<string, unknown> | null>(null);
  const [calcRequestId, setCalcRequestId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { originCountry, destinationCountry, lines, setStep1, updateLine, addLine, reset } =
    useCalculatorStore();

  const [invoiceBanner, setInvoiceBanner] = useState(false);

  // Pre-fill from invoice upload if navigated from invoice page
  useEffect(() => {
    if (searchParams?.get("from") !== "invoice") return;
    try {
      const raw = sessionStorage.getItem("invoiceData");
      if (!raw) return;
      sessionStorage.removeItem("invoiceData");
      const data = JSON.parse(raw) as Record<string, unknown>;

      // Country name → ISO-2 fallback map
      const countryMap: Record<string, string> = {
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
      const toISO = (v: unknown): string | null => {
        if (!v || typeof v !== "string") return null;
        const trimmed = v.trim();
        if (trimmed.length === 2) return trimmed.toUpperCase();
        return countryMap[trimmed.toLowerCase()] ?? trimmed;
      };

      const origin = toISO(data.origin_country ?? data.country_of_origin);
      const dest = toISO(data.destination ?? data.destination_country);
      if (origin || dest) {
        setStep1({ ...(origin ? { originCountry: origin } : {}), ...(dest ? { destinationCountry: dest } : {}) });
      }

      // Handle line items array (multiple lines)
      const invoiceLines = (data.line_items ?? data.lines ?? data.items) as unknown[] | undefined;
      if (Array.isArray(invoiceLines) && invoiceLines.length > 0) {
        // Reset to match invoice line count
        reset();
        if (origin || dest) {
          setStep1({ ...(origin ? { originCountry: origin } : {}), ...(dest ? { destinationCountry: dest } : {}) });
        }
        invoiceLines.forEach((item, i) => {
          const line = item as Record<string, unknown>;
          if (i > 0) addLine();
          updateLine(i, {
            hs_code: String(line.hs_code ?? line.commodity_code ?? ""),
            description: String(line.description ?? line.goods_description ?? ""),
            value: line.unit_price ?? line.value ?? line.amount
              ? String(line.unit_price ?? line.value ?? line.amount)
              : "",
            currency: String(line.currency ?? data.currency ?? "GBP"),
          });
        });
      } else {
        // Single-line pre-fill
        updateLine(0, {
          hs_code: String(data.hs_code ?? data.commodity_code ?? ""),
          description: String(data.description ?? data.goods_description ?? ""),
          value: (data.invoice_value ?? data.total_value)
            ? String(data.invoice_value ?? data.total_value)
            : "",
          currency: String(data.currency ?? "GBP"),
        });
      }

      setInvoiceBanner(true);
      setTimeout(() => setInvoiceBanner(false), 5000);
    } catch {
      // ignore bad sessionStorage data
    }
  }, [searchParams, setStep1, updateLine, addLine, reset]);

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
      const request = {
        origin: originCountry,
        destination: destinationCountry,
        lines: validLines.map((l) => ({
          hs_code: l.hs_code,
          description: l.description || undefined,
          customs_value: l.value || "0",
          currency: l.currency || "GBP",
        })),
      };

      const result = await calculationsApi.submitSync(request) as unknown as Record<string, unknown>;
      // Response is wrapped: { data: {...}, meta: {...} }
      const inner = (result?.data ?? result) as Record<string, unknown>;
      setCalcResult(result);
      setCalcRequestId((inner?.request_id ?? null) as string | null);
      setShowResults(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Calculation failed.";
      // Surface the raw error object if available (API validation errors, etc.)
      const detail = typeof err === "object" && err !== null && "detail" in err
        ? JSON.stringify((err as Record<string, unknown>).detail)
        : null;
      setErrorMsg(detail ? `${msg} — ${detail}` : msg);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNewCalculation = () => {
    setShowResults(false);
    setCalcResult(null);
    setCalcRequestId(null);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-2">New Calculation</h1>
          <p className="font-mono text-sm text-[var(--muted2)]">
            Estimate landed cost, duties, and taxes for international shipments.
          </p>
        </header>

        {invoiceBanner && (
          <div className="mb-4 px-4 py-3 bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.25)] rounded-lg text-sm text-[var(--cyan)] font-mono flex items-center gap-2">
            <CheckCircle size={14} className="flex-shrink-0" />
            Calculator pre-filled from your invoice.
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <motion.div
            layout
            className={`w-full ${showResults ? "xl:w-[60%]" : "xl:w-full max-w-4xl mx-auto"} transition-all duration-500`}
          >
            <CalculatorPanel onCalculate={handleCalculate} isLoading={isCalculating} />
          </motion.div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full xl:w-[40%]"
              >
                <ResultsPanel
                  result={calcResult}
                  requestId={calcRequestId}
                  onNewCalculation={handleNewCalculation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
