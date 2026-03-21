"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

  const { originCountry, destinationCountry, lines, setStep1, updateLine } =
    useCalculatorStore();

  // Pre-fill from invoice upload if navigated from invoice page
  useEffect(() => {
    if (searchParams?.get("from") === "invoice") {
      try {
        const raw = sessionStorage.getItem("invoiceData");
        if (raw) {
          const data = JSON.parse(raw) as Record<string, unknown>;
          if (data.origin_country || data.country_of_origin) {
            setStep1({ originCountry: (data.origin_country ?? data.country_of_origin) as string });
          }
          if (data.destination || data.destination_country) {
            setStep1({ destinationCountry: (data.destination ?? data.destination_country) as string });
          }
          updateLine(0, {
            hs_code: (data.hs_code ?? data.commodity_code ?? "") as string,
            description: (data.description ?? data.goods_description ?? "") as string,
            value: data.invoice_value ?? data.total_value
              ? String(data.invoice_value ?? data.total_value)
              : "",
            currency: (data.currency ?? "GBP") as string,
          });
        }
      } catch {
        // ignore bad sessionStorage data
      }
    }
  }, [searchParams, setStep1, updateLine]);

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

      console.log("[calc] request →", JSON.stringify(request, null, 2));
      const result = await calculationsApi.submitSync(request) as unknown as Record<string, unknown>;
      console.log("[calc] response →", JSON.stringify(result, null, 2));
      setCalcResult(result);
      setCalcRequestId((result?.request_id ?? result?.id ?? null) as string | null);
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
