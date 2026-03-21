"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calculator,
  Plus,
  X,
} from "lucide-react";
import { calculationsApi } from "@/lib/api/calculations";
import { useCalculatorStore } from "@/lib/stores/calculatorStore";

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

function formatDate(raw: string | undefined) {
  if (!raw) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

export default function ProfilesPage() {
  const router = useRouter();
  const { setStep1, updateLine, lines } = useCalculatorStore();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = (await calculationsApi.listProfiles()) as
        | { items?: Profile[]; results?: Profile[] }
        | Profile[];

      setProfiles(Array.isArray(res) ? res : (res.items ?? res.results ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (pid: string) => {
    if (!confirm("Delete this profile? This cannot be undone.")) return;
    setDeleting(pid);
    try {
      await calculationsApi.deleteProfile(pid);
      setProfiles((prev) => prev.filter((p) => getPid(p) !== pid));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadProfile = (profile: Profile) => {
    const sd = profile.shipment_data ?? {};
    if (sd.origin) setStep1({ originCountry: sd.origin as string });
    if (sd.destination) setStep1({ destinationCountry: sd.destination as string });

    const ld = profile.lines_data ?? [];
    ld.forEach((line, i) => {
      if (i >= lines.length) return;
      updateLine(i, {
        hs_code: (line.hs_code ?? "") as string,
        description: (line.description ?? "") as string,
        value: line.customs_value != null ? String(line.customs_value) : "",
        currency: (line.currency ?? "GBP") as string,
      });
    });

    router.push("/calculator");
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      await calculationsApi.createProfile({
        name: createName.trim(),
        description: createDesc.trim() || null,
        shipment_data: {},
        lines_data: [{}],
      });
      setCreateName("");
      setCreateDesc("");
      setShowCreate(false);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create profile.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <BookMarked size={22} className="text-[var(--cyan)]" />
            Saved Profiles
          </h1>
          <p className="text-sm text-[var(--muted2)] mt-1">
            Reusable calculation templates. Load a profile to pre-fill the calculator.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)] hover:border-[var(--cyan)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cyan)] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> New Profile
          </button>
        </div>
      </div>

      {/* Create profile panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[var(--s1)] border border-[var(--cyan)]/30 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">Create New Profile</h2>
              <button onClick={() => setShowCreate(false)} className="text-[var(--muted2)] hover:text-[var(--text)]">
                <X size={16} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">
                  Name *
                </label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. UK → Germany steel export"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[var(--muted2)] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Optional notes…"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3.5 py-2.5 font-mono text-sm text-[var(--text)] focus:border-[var(--cyan)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted2)] hover:text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createName.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--cyan)] text-black font-semibold text-sm disabled:opacity-50"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && !profiles.length ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[var(--cyan)]" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-24 bg-[var(--s1)] border border-[var(--border)] rounded-xl">
          <BookMarked size={40} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--muted2)] text-sm">No saved profiles yet.</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Run a calculation and click &quot;Save as profile&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile, i) => {
            const pid = getPid(profile);
            return (
              <motion.div
                key={pid || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[var(--s1)] border border-[var(--border)] rounded-xl p-5 hover:border-[rgba(0,229,255,0.3)] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[var(--text)] truncate">{profile.name}</h3>
                    {profile.description && (
                      <p className="text-xs text-[var(--muted2)] mt-0.5 line-clamp-2">{profile.description}</p>
                    )}
                  </div>
                  {pid && (
                    <button
                      onClick={() => handleDelete(pid)}
                      disabled={deleting === pid}
                      className="ml-3 flex-shrink-0 text-[var(--muted2)] hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deleting === pid ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--muted2)] mb-4">
                  {typeof profile.shipment_data?.origin === "string" && typeof profile.shipment_data?.destination === "string" && (
                    <span>
                      {profile.shipment_data.origin}
                      <span className="text-[var(--cyan)] mx-1">→</span>
                      {profile.shipment_data.destination}
                    </span>
                  )}
                  {profile.lines_data && (
                    <span>{profile.lines_data.length} line{profile.lines_data.length !== 1 ? "s" : ""}</span>
                  )}
                  <span className="ml-auto">{formatDate(profile.updated_at ?? profile.created_at)}</span>
                </div>

                <button
                  onClick={() => handleLoadProfile(profile)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] text-[var(--cyan)] text-xs font-bold hover:bg-[rgba(0,229,255,0.14)] transition-colors"
                >
                  <Calculator size={14} /> Load into Calculator
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
