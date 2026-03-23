"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { AiResultPanel } from "@/components/dashboard/ResultsPanel";
import { tariffApi } from "@/lib/api/tariff";
import { calculationsApi } from "@/lib/api/calculations";

const AI_RESULT_KEY = "veritariff_ai_result";

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
        <span className="font-mono text-sm text-[var(--muted2)]">AI Full Report</span>
      </div>

      <AiResultPanel raw={aiResult} />
    </div>
  );
}
