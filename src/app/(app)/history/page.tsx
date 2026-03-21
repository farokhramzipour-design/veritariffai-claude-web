"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  History,
  ArrowRight,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { calculationsApi } from "@/lib/api/calculations";

interface CalcSummary {
  request_id?: string;
  id?: string;
  status?: string;
  created_at?: string;
  origin?: string;
  destination?: string;
  total_landed_cost_gbp?: number;
  total_gbp?: number;
  lines?: unknown[];
  [key: string]: unknown;
}

const LIMIT = 20;

function getId(c: CalcSummary) {
  return (c.request_id ?? c.id ?? "") as string;
}

function formatDate(raw: string | undefined) {
  if (!raw) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

function formatCost(c: CalcSummary) {
  const v = c.total_landed_cost_gbp ?? c.total_gbp;
  if (v == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    typeof v === "number" ? v : parseFloat(String(v))
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toLowerCase();
  const [bg, text] =
    s === "completed" || s === "done"
      ? ["bg-green-500/10 border-green-500/30 text-green-400", "Completed"]
      : s === "failed" || s === "error"
      ? ["bg-red-500/10 border-red-500/30 text-red-400", "Failed"]
      : s === "pending" || s === "processing"
      ? ["bg-yellow-500/10 border-yellow-500/30 text-yellow-400", "Pending"]
      : ["bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.2)] text-[var(--cyan)]", status ?? "—"];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${bg}`}>
      {text}
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<CalcSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetch = useCallback(async (off: number) => {
    setLoading(true);
    setError("");
    try {
      const res = (await calculationsApi.list({ limit: LIMIT, offset: off })) as
        | { items?: CalcSummary[]; total?: number; results?: CalcSummary[]; count?: number }
        | CalcSummary[];

      if (Array.isArray(res)) {
        setItems(res);
        setTotal(res.length);
      } else {
        setItems((res.items ?? res.results ?? []) as CalcSummary[]);
        setTotal(((res.total ?? res.count) as number | undefined) ?? 0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(offset); }, [fetch, offset]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this calculation? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await calculationsApi.delete(id);
      setItems((prev) => prev.filter((c) => getId(c) !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <History size={22} className="text-[var(--cyan)]" />
            Calculation History
          </h1>
          <p className="text-sm text-[var(--muted2)] mt-1">
            View, revisit, and manage all your past calculations.
          </p>
        </div>
        <button
          onClick={() => fetch(offset)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)] hover:border-[var(--cyan)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-xl overflow-hidden">
        {loading && !items.length ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 size={28} className="animate-spin text-[var(--cyan)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <History size={40} className="text-[var(--muted)] mx-auto mb-4" />
            <p className="text-[var(--muted2)] text-sm">No calculations yet.</p>
            <button
              onClick={() => router.push("/calculator")}
              className="mt-4 text-sm text-[var(--cyan)] hover:underline"
            >
              Run your first calculation →
            </button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-3 text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">Route</th>
                <th className="px-5 py-3 text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider text-right">Total</th>
                <th className="px-5 py-3 text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => {
                const id = getId(c);
                return (
                  <motion.tr
                    key={id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[rgba(28,45,71,0.4)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted2)]">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-[var(--text)]">
                        {c.origin ?? "—"}
                        <span className="text-[var(--cyan)] mx-1">→</span>
                        {c.destination ?? "—"}
                      </span>
                      {c.lines && Array.isArray(c.lines) && (
                        <span className="ml-2 text-[10px] text-[var(--muted2)] font-mono">
                          {c.lines.length} line{c.lines.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status as string} />
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-[var(--cyan)] text-right">
                      {formatCost(c)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {id && (
                          <button
                            onClick={() => router.push(`/calculator/result/${id}`)}
                            className="flex items-center gap-1 text-xs text-[var(--muted2)] hover:text-[var(--cyan)] transition-colors"
                          >
                            View <ArrowRight size={12} />
                          </button>
                        )}
                        {id && (
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={deleting === id}
                            className="text-[var(--muted2)] hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            {deleting === id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted2)] font-mono text-xs">
            Page {currentPage} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0 || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--muted2)] hover:text-[var(--text)] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--muted2)] hover:text-[var(--text)] disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
