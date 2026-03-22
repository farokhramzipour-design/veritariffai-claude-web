"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";

export interface UploadResult {
  fileName: string;
  fileSize: number;
  sha256: string;
  preview?: Record<string, string>;
}

interface Props {
  label: string;
  sublabel?: string;
  hint?: string;
  onUpload: (result: UploadResult) => void;
  onRemove?: () => void;
  uploadedFile?: string;
  accept?: string;
  maxMB?: number;
}

async function hashFile(buffer: ArrayBuffer): Promise<string> {
  const hashBuf = await crypto.subtle.digest("SHA-256", buffer);
  const arr = Array.from(new Uint8Array(hashBuf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function UploadZone({
  label,
  sublabel,
  hint,
  onUpload,
  onRemove,
  uploadedFile,
  accept = ".pdf,.docx,.jpg,.jpeg,.png",
  maxMB = 10,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError("");
      if (file.size > maxMB * 1024 * 1024) {
        setError(`File exceeds ${maxMB}MB limit`);
        return;
      }
      setLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const sha256 = await hashFile(buffer);
        onUpload({ fileName: file.name, fileSize: file.size, sha256 });
      } catch {
        setError("Failed to process file");
      } finally {
        setLoading(false);
      }
    },
    [maxMB, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-3 p-3 bg-[rgba(15,110,86,0.1)] border border-[rgba(52,211,153,0.25)] rounded-lg">
        <CheckCircle size={16} className="text-[#34d399] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-[#34d399] truncate">{uploadedFile}</p>
          {sublabel && <p className="text-[10px] text-[#8BA3C1] mt-0.5">{sublabel}</p>}
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-[#8BA3C1] hover:text-[#f87171] transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-all select-none ${
          dragging
            ? "border-[#5BA3D9] bg-[rgba(91,163,217,0.08)]"
            : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(91,163,217,0.4)] hover:bg-[rgba(91,163,217,0.04)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        {loading ? (
          <Loader2 size={20} className="text-[#5BA3D9] animate-spin" />
        ) : (
          <Upload size={20} className="text-[#8BA3C1]" />
        )}
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-[#F8F6F0]">{label}</p>
          {sublabel && <p className="text-[10px] text-[#8BA3C1] mt-0.5">{sublabel}</p>}
          <p className="text-[10px] text-[#8BA3C1] mt-1">{hint ?? `PDF, DOCX, JPG, PNG · Max ${maxMB}MB`}</p>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#f87171] font-mono">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

export function DocumentRow({
  name,
  docRef,
  hash,
  status,
  onView,
  onAdd,
}: {
  name: string;
  docRef?: string;
  hash?: string;
  status: "uploaded" | "generated" | "missing" | "optional";
  onView?: () => void;
  onAdd?: () => void;
}) {
  const isPresent = status === "uploaded" || status === "generated";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
      <div className="flex-shrink-0">
        {isPresent ? (
          <CheckCircle size={14} className="text-[#34d399]" />
        ) : status === "missing" ? (
          <AlertCircle size={14} className="text-[#f87171]" />
        ) : (
          <FileText size={14} className="text-[#8BA3C1]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-[#F8F6F0] truncate">{name}</p>
        {docRef && <p className="text-[10px] text-[#8BA3C1] mt-0.5">{docRef}</p>}
      </div>
      {hash && (
        <p className="font-mono text-[10px] text-[#5BA3D9] flex-shrink-0">{hash.slice(0, 8)}…</p>
      )}
      <div className="flex-shrink-0">
        {isPresent && onView && (
          <button
            onClick={onView}
            className="font-mono text-[10px] text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors"
          >
            [View]
          </button>
        )}
        {!isPresent && onAdd && (
          <button
            onClick={onAdd}
            className="font-mono text-[10px] text-[#8BA3C1] hover:text-[#5BA3D9] transition-colors"
          >
            [Add]
          </button>
        )}
      </div>
    </div>
  );
}
