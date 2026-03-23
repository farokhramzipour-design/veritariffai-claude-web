"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, FileText } from "lucide-react";
import { ResultsPanel, AiResultPanel } from "@/components/dashboard/ResultsPanel";
import { calculationsApi } from "@/lib/api/calculations";
import { tariffApi } from "@/lib/api/tariff";

interface AuditEntry {
  step?: string;
  action?: string;
  name?: string;
  timestamp?: string;
  created_at?: string;
  source?: string;
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export default function ResultPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [res, auditRes] = await Promise.allSettled([
          calculationsApi.getResult(id),
          calculationsApi.getAuditTrail(id),
        ]);

        if (res.status === "fulfilled") {
          const raw = res.value as unknown as Record<string, unknown>;
          setResult(raw);

          // Extract fields for AI analysis
          const d = (raw.data && typeof raw.data === "object" ? raw.data : raw) as Record<string, unknown>;
          const lines = (d.lines ?? d.line_items ?? []) as Record<string, unknown>[];
          const firstLine = lines[0] ?? {};
          const origin = (d.origin ?? d.origin_country ?? "") as string;
          const destination = (d.destination ?? d.destination_country ?? "") as string;
          const description = (firstLine.description ?? d.product_description ?? "") as string;
          const hsCode = (firstLine.hs_code ?? "") as string;
          const customsValue = parseFloat(String(firstLine.customs_value ?? d.customs_value ?? 0)) || 0;
          const currency = (firstLine.currency ?? d.currency ?? "GBP") as string;

          if (origin && destination && (description || hsCode) && customsValue > 0) {
            tariffApi.importAnalysis({
              product_description: description || hsCode,
              origin_country: origin,
              destination_country: destination,
              customs_value: customsValue,
              currency,
            }).then((r) => {
              setAiResult(r as unknown as Record<string, unknown>);
            }).catch((e) => {
              console.error("[AI] importAnalysis failed on result page:", e);
            });
          }
        } else {
          throw new Error((res.reason as Error)?.message ?? "Failed to load result.");
        }

        if (auditRes.status === "fulfilled") {
          const a = auditRes.value as AuditEntry[] | { items?: AuditEntry[]; entries?: AuditEntry[] };
          setAudit(Array.isArray(a) ? a : (a.items ?? a.entries ?? []));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load calculation result.");
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

  if (error) {
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
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/history")}
          className="flex items-center gap-2 text-sm text-[var(--muted2)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={16} /> History
        </button>
        <span className="text-[var(--muted)]">/</span>
        <span className="font-mono text-sm text-[var(--muted2)] truncate max-w-xs">{id}</span>
      </div>

      {aiResult && <AiResultPanel raw={aiResult} />}

      <ResultsPanel result={result} requestId={id} />

      {audit.length > 0 && (
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-6">
          <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-5">
            <FileText size={16} className="text-[var(--cyan)]" />
            Audit Trail
          </h3>
          <div className="space-y-3">
            {audit.map((entry, i) => (
              <div key={i} className="flex gap-4 text-xs font-mono">
                <span className="text-[var(--muted2)] flex-shrink-0 w-36">
                  {entry.timestamp ?? entry.created_at
                    ? new Date((entry.timestamp ?? entry.created_at) as string).toLocaleTimeString("en-GB")
                    : `Step ${i + 1}`}
                </span>
                <span className="text-[var(--cyan)] flex-shrink-0">
                  {entry.step ?? entry.action ?? entry.name ?? "event"}
                </span>
                <span className="text-[var(--muted2)]">
                  {entry.detail ?? entry.message ?? entry.source ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
