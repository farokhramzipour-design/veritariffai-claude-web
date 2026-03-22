"use client";

import { useState } from "react";
import { CheckCircle, Circle, Download, Mail, Building2, Copy, Check } from "lucide-react";
import { useShipment } from "../components/ShipmentContext";
import { DocumentRow } from "../components/UploadZone";
import { StatusPill } from "../components/StatusPill";

const MANDATORY_DOCS = [
  { name: "Commercial Invoice", ref: "VT-INV-2026-0047", hash: "a3f9c8d1e2b4f5a6" },
  { name: "Packing List", ref: "VT-PKG-2026-0047", hash: "b8e4d2c9f1a3e7b5" },
  { name: "Mill Test Certificate", ref: "SAW-MTC-2026-1847", hash: "c2d8a1f4b9e3c6d7" },
  { name: "CDS MRN", ref: "26GBIMM0000047VT1", hash: "auto" },
  { name: "Sanctions clearance", ref: "Screen #4821", hash: "d4e1b8c3a9f2d5e6" },
];

const CONDITIONAL_DOCS = [
  { name: "Statement on Origin", ref: "Generated Step 3", hash: "e9a2d5b1c8f4e3a7" },
  { name: "CBAM Embedded Emissions", ref: "Generated Step 5", hash: "f1b3c7e4d2a9f8b2" },
];

const OPTIONAL_DOCS = [
  { name: "Supplier's Declaration", ref: "Not uploaded" },
  { name: "EUR.1 Certificate", ref: "Not required" },
];

const RELEASE_GATES = [
  "All mandatory documents: VALIDATED",
  "TCA declaration signed",
  "CBAM data complete",
  "Sanctions: all parties cleared",
];

export function Step7_Bundle() {
  const { setCurrentStep, setStepStatus, shipmentId } = useShipment();
  const [allPassed] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [certTimestamp] = useState(new Date().toISOString());

  const certHash = "sha256:a3f9c8d1e2b4f5a6b8e4d2c9f1a3e7b5c2d8a1f4b9e3c6d7d4e1b8c3a9f2d5e6";

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(certHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleComplete = () => {
    setStepStatus(7, "complete");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[#5BA3D9] flex items-center justify-center">
              <span className="font-mono text-[11px] font-bold text-[#5BA3D9]">7</span>
            </div>
            <h2 className="font-mono text-base font-bold text-[#F8F6F0]">
              Step 7 — Barrister&apos;s Bundle
            </h2>
          </div>
          <p className="font-mono text-xs text-[#8BA3C1] ml-8">
            Document validation gate and clearance certificate generation.
          </p>
        </div>
        <StatusPill status="active" />
      </div>

      {/* Document validation gate */}
      <div className="bg-[rgba(13,31,60,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
        <h3 className="font-mono text-[10px] font-bold text-[#8BA3C1] uppercase tracking-widest mb-4">
          Document Validation Gate
        </h3>

        <div className="mb-4">
          <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-2">MANDATORY</p>
          {MANDATORY_DOCS.map((doc) => (
            <DocumentRow
              key={doc.name}
              name={doc.name}
              ref={doc.ref}
              hash={doc.hash !== "auto" ? doc.hash : undefined}
              status="uploaded"
              onView={() => {}}
            />
          ))}
        </div>

        <div className="mb-4">
          <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-2">CONDITIONAL</p>
          {CONDITIONAL_DOCS.map((doc) => (
            <DocumentRow
              key={doc.name}
              name={doc.name}
              ref={doc.ref}
              hash={doc.hash}
              status="generated"
              onView={() => {}}
            />
          ))}
        </div>

        <div className="mb-5">
          <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mb-2">OPTIONAL</p>
          {OPTIONAL_DOCS.map((doc) => (
            <DocumentRow
              key={doc.name}
              name={doc.name}
              ref={doc.ref}
              status="optional"
              onAdd={() => {}}
            />
          ))}
        </div>

        {/* Release gate */}
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
          <p className="font-mono text-[10px] font-bold text-[#F8F6F0] uppercase tracking-widest mb-3">
            Release Gate
          </p>
          <div className="space-y-2">
            {RELEASE_GATES.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-[#34d399] flex-shrink-0" />
                <p className="font-mono text-xs text-[#F8F6F0]">{g}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clearance Certificate */}
      {allPassed && (
        <div className="bg-[rgba(15,110,86,0.12)] border border-[rgba(52,211,153,0.35)] rounded-xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <CheckCircle size={20} className="text-[#34d399] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-base font-bold text-[#34d399]">✓ CLEARED FOR EXPORT</p>
              <p className="font-mono text-[10px] text-[#8BA3C1] uppercase tracking-widest mt-0.5">
                Veritariff Clearance Certificate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1]">Shipment</p>
              <p className="font-mono text-xs font-bold text-[#F8F6F0]">{shipmentId}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1]">Corridor</p>
              <p className="font-mono text-xs font-bold text-[#F8F6F0]">UK → Germany</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1]">HS Code</p>
              <p className="font-mono text-xs font-bold text-[#F8F6F0]">7224 90 02 89</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#8BA3C1]">Timestamp (UTC)</p>
              <p className="font-mono text-xs font-bold text-[#F8F6F0]">{certTimestamp}</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="font-mono text-[10px] text-[#8BA3C1] mb-1">SHA-256</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-[11px] text-[#5BA3D9] break-all flex-1">{certHash}</p>
              <button onClick={handleCopyHash} className="text-[#8BA3C1] hover:text-[#F8F6F0] transition-colors flex-shrink-0">
                {copiedHash ? <Check size={13} className="text-[#34d399]" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#185FA5] text-white font-mono text-xs font-bold hover:opacity-90 transition-opacity">
              <Download size={13} />
              Download Bundle (AES-256 ZIP)
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-xs transition-colors">
              <Mail size={13} />
              Send to: Exporter · FF · DE Importer
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-xs transition-colors">
              <Building2 size={13} />
              Submit to bank for trade finance
            </button>
          </div>
        </div>
      )}

      {/* Footer attribution */}
      <div className="p-3 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(255,255,255,0.06)]">
        <p className="font-mono text-[10px] text-[#8BA3C1]">
          Contains public sector information licensed under the{" "}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5BA3D9] underline"
          >
            Open Government Licence v3.0
          </a>
          . Data: UK Trade Tariff API, HMRC, EU TARIC. © Veritariff Ltd — Confidential.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentStep(6)}
          className="px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8BA3C1] hover:text-[#F8F6F0] font-mono text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2.5 rounded-lg bg-[#0F6E56] text-white font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          ✓ Complete Workflow
        </button>
      </div>
    </div>
  );
}
