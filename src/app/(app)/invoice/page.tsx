"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, X, CheckCircle, AlertCircle,
  Loader2, ArrowRight, Package, Hash, DollarSign, MapPin,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { invoiceApi } from "@/lib/api/invoice";

type UploadState = "idle" | "uploading" | "success" | "error";

type InvoicePayload = Record<string, unknown>;

// Unwrap { data: {...}, meta: {...} } if present
function unwrapResponse(raw: Record<string, unknown>): InvoicePayload {
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    return raw.data as InvoicePayload;
  }
  return raw;
}

function InvoiceField({
  label, value, icon: Icon,
}: {
  label: string; value: string; icon: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-3 bg-[var(--s2)] rounded-lg border border-[var(--border)]">
      <Icon size={16} className="text-[var(--cyan)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--muted2)] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-[var(--text)] font-mono break-all">{value}</p>
      </div>
    </div>
  );
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default function InvoiceUploadPage() {
  const router = useRouter();
  const { accessToken, checkAuth, isLoading } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [payload, setPayload] = useState<InvoicePayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are accepted.");
      setUploadState("error");
      return;
    }
    setFile(f);
    setUploadState("idle");
    setErrorMsg("");
    setPayload(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!accessToken) {
      if (isLoading) { setTimeout(handleUpload, 800); return; }
      setErrorMsg("Session not found. Please log out and log in again.");
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setErrorMsg("");

    try {
      const raw = await invoiceApi.upload(file) as unknown as Record<string, unknown>;
      const data = unwrapResponse(raw);
      setPayload(data);
      setUploadState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploadState("error");
    }
  };

  const handleStartCalculation = () => {
    if (!payload) return;
    sessionStorage.setItem("invoiceData", JSON.stringify(payload));
    router.push("/calculator?from=invoice");
  };

  const reset = () => {
    setFile(null);
    setUploadState("idle");
    setPayload(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Fields to surface prominently
  const knownFields: { label: string; key: string; icon: React.ElementType }[] = [
    { label: "HS / Commodity Code",  key: "hs_code",           icon: Hash      },
    { label: "Commodity Code",       key: "commodity_code",    icon: Hash      },
    { label: "Description",          key: "description",       icon: FileText  },
    { label: "Goods Description",    key: "goods_description", icon: FileText  },
    { label: "Invoice Value",        key: "invoice_value",     icon: DollarSign},
    { label: "Total Value",          key: "total_value",       icon: DollarSign},
    { label: "Currency",             key: "currency",          icon: DollarSign},
    { label: "Origin Country",       key: "origin_country",    icon: MapPin    },
    { label: "Country of Origin",    key: "country_of_origin", icon: MapPin    },
    { label: "Destination",          key: "destination",       icon: MapPin    },
    { label: "Destination Country",  key: "destination_country",icon: MapPin   },
    { label: "Net Weight (kg)",      key: "net_weight",        icon: Package   },
    { label: "Gross Weight (kg)",    key: "gross_weight",      icon: Package   },
    { label: "Quantity",             key: "quantity",          icon: Package   },
    { label: "Seller",               key: "seller",            icon: FileText  },
    { label: "Buyer",                key: "buyer",             icon: FileText  },
    { label: "Invoice Number",       key: "invoice_number",    icon: Hash      },
    { label: "Invoice Date",         key: "invoice_date",      icon: FileText  },
  ];

  const surfacedKeys = new Set<string>();
  const prominentFields = knownFields.filter((f) => {
    const val = payload?.[f.key];
    if (val !== undefined && val !== null && val !== "") {
      surfacedKeys.add(f.key);
      return true;
    }
    return false;
  });

  // Also surface line_items / lines array
  const lineItems = payload
    ? ((payload.line_items ?? payload.lines ?? payload.items) as unknown[] | undefined)
    : undefined;
  if (lineItems) { surfacedKeys.add("line_items"); surfacedKeys.add("lines"); surfacedKeys.add("items"); }

  const remainingEntries = payload
    ? Object.entries(payload).filter(([k]) => !surfacedKeys.has(k))
    : [];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">Invoice Upload</h1>
        <p className="text-sm text-[var(--muted2)] mt-1">
          Upload a commercial invoice PDF — we extract the trade data and pre-fill a new calculation for you.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragOver ? "border-[var(--cyan)] bg-[rgba(0,229,255,0.05)]" : "border-[var(--border)] hover:border-[rgba(0,229,255,0.4)]"}
          ${uploadState === "success" ? "border-green-500/40 bg-green-500/5" : ""}
          ${uploadState === "error" ? "border-red-500/40 bg-red-500/5" : ""}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onInputChange} />

        <div className="p-10 flex flex-col items-center text-center gap-4">
          {uploadState === "success" ? (
            <CheckCircle size={40} className="text-green-500" />
          ) : uploadState === "error" ? (
            <AlertCircle size={40} className="text-red-400" />
          ) : file ? (
            <FileText size={40} className="text-[var(--cyan)]" />
          ) : (
            <Upload size={40} className="text-[var(--muted2)]" />
          )}

          {file ? (
            <div>
              <p className="font-semibold text-[var(--text)]">{file.name}</p>
              <p className="text-xs text-[var(--muted2)] mt-1">{(file.size / 1024).toFixed(1)} KB — PDF</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-[var(--text)]">
                {dragOver ? "Drop PDF here" : "Drag & drop your invoice PDF"}
              </p>
              <p className="text-xs text-[var(--muted2)] mt-1">or click to browse — PDF only</p>
            </div>
          )}

          {uploadState === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {file && uploadState !== "success" && (
          <button
            onClick={handleUpload}
            disabled={uploadState === "uploading"}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--cyan)] text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {uploadState === "uploading" ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading…</>
            ) : (
              <><Upload size={16} /> Upload Invoice</>
            )}
          </button>
        )}
        {file && (
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--muted2)] text-sm hover:text-[var(--text)] transition-colors">
            <X size={16} /> Clear
          </button>
        )}
        {!file && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--cyan)] text-[var(--cyan)] font-semibold text-sm hover:bg-[rgba(0,229,255,0.05)] transition-colors"
          >
            <Upload size={16} /> Choose PDF
          </button>
        )}
      </div>

      {/* Response */}
      <AnimatePresence>
        {uploadState === "success" && payload && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Prominent fields */}
            {prominentFields.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  Extracted Invoice Data
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {prominentFields.map((f) => (
                    <InvoiceField
                      key={f.key}
                      label={f.label}
                      value={renderValue(payload[f.key])}
                      icon={f.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Line items table */}
            {lineItems && Array.isArray(lineItems) && lineItems.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">
                  Line Items ({lineItems.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {Object.keys(lineItems[0] as Record<string, unknown>).map(k => (
                          <th key={k} className="py-2 px-3 text-[var(--muted2)] uppercase text-[10px] tracking-wider">{k.replace(/_/g, " ")}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(lineItems as Record<string, unknown>[]).map((item, i) => (
                        <tr key={i} className="border-b border-[rgba(28,45,71,0.3)] hover:bg-[rgba(255,255,255,0.02)]">
                          {Object.values(item).map((v, j) => (
                            <td key={j} className="py-2 px-3 text-[var(--text)]">{renderValue(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Remaining raw fields */}
            {remainingEntries.length > 0 && (
              <details className="group">
                <summary className="text-xs text-[var(--muted2)] cursor-pointer hover:text-[var(--text)] transition-colors select-none">
                  {remainingEntries.length} more field{remainingEntries.length !== 1 ? "s" : ""} ▸
                </summary>
                <pre className="mt-3 p-4 bg-[var(--s2)] border border-[var(--border)] rounded-lg text-xs text-[var(--muted2)] font-mono overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(Object.fromEntries(remainingEntries), null, 2)}
                </pre>
              </details>
            )}

            {/* CTA */}
            <div className="flex items-center gap-4 p-5 bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.2)] rounded-xl">
              <div className="flex-1">
                <p className="font-semibold text-[var(--text)] text-sm">Ready to calculate</p>
                <p className="text-xs text-[var(--muted2)] mt-0.5">
                  Invoice data extracted — open the calculator with all fields pre-filled.
                </p>
              </div>
              <button
                onClick={handleStartCalculation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--cyan)] text-black font-bold text-sm hover:opacity-90 transition-opacity flex-shrink-0"
              >
                New Calculation <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
