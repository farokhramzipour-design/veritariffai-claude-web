"use client";

import React, { useEffect } from 'react';
import { ChevronLeft, Package, CheckCircle, XCircle, Clock, MinusCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useShipmentStore, DocumentStatus, BundleDocument } from '@/lib/stores/shipmentStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
  onReset: () => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  VALIDATED: {
    icon: <CheckCircle size={16} />,
    color: 'text-[var(--cyan)]',
    bg: 'bg-[rgba(100,255,218,0.06)]',
    border: 'border-[rgba(100,255,218,0.2)]',
    label: 'VALIDATED',
  },
  MISSING: {
    icon: <XCircle size={16} />,
    color: 'text-[#ff5370]',
    bg: 'bg-[rgba(255,83,112,0.06)]',
    border: 'border-[rgba(255,83,112,0.2)]',
    label: 'MISSING',
  },
  NOT_REQUIRED: {
    icon: <MinusCircle size={16} />,
    color: 'text-[var(--muted2)]',
    bg: 'bg-transparent',
    border: 'border-[var(--border)]',
    label: 'NOT REQUIRED',
  },
  PENDING: {
    icon: <Clock size={16} />,
    color: 'text-[#ffd166]',
    bg: 'bg-[rgba(255,209,102,0.06)]',
    border: 'border-[rgba(255,209,102,0.2)]',
    label: 'PENDING',
  },
  BLOCKED: {
    icon: <XCircle size={16} />,
    color: 'text-[#ff5370]',
    bg: 'bg-[rgba(255,83,112,0.1)]',
    border: 'border-[rgba(255,83,112,0.4)]',
    label: 'BLOCKED',
  },
};

const DocumentRow = ({ doc, onMarkValidated }: { doc: BundleDocument; onMarkValidated: (id: string) => void }) => {
  const statusCfg = STATUS_CONFIG[doc.status];

  return (
    <motion.div
      layout
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${statusCfg.bg} ${statusCfg.border}`}
    >
      <div className={`flex-shrink-0 ${statusCfg.color}`}>{statusCfg.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-mono text-sm text-[var(--text)] font-bold">{doc.name}</p>
          {doc.mandatory && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[rgba(255,83,112,0.15)] text-[#ff5370] rounded uppercase tracking-wider">
              mandatory
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">
          {doc.step} · {doc.condition}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
        {doc.status === 'MISSING' && (
          <button
            onClick={() => onMarkValidated(doc.id)}
            className="px-2 py-1 text-[10px] font-mono border border-[var(--border2)] text-[var(--muted2)] rounded hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
          >
            Mark OK
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const Step7_Bundle = ({ onBack, onReset }: Props) => {
  const { bundle, buildBundle, updateBundle, markStepComplete } = useShipmentStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { buildBundle(); }, []);

  const handleMarkValidated = (docId: string) => {
    const updated = bundle.documents.map((d) =>
      d.id === docId ? { ...d, status: 'VALIDATED' as DocumentStatus } : d,
    );
    updateBundle({ documents: updated });
    // Re-evaluate shipment status
    const mandatoryMissing = updated.some((d) => d.mandatory && d.status === 'MISSING');
    const blocked = updated.some((d) => d.status === 'BLOCKED');
    const shipmentStatus = blocked ? 'BLOCKED' : mandatoryMissing ? 'PENDING' : 'CLEARED_FOR_EXPORT';
    if (shipmentStatus === 'CLEARED_FOR_EXPORT') {
      markStepComplete(7);
    }
    updateBundle({
      documents: updated,
      shipmentStatus,
      clearanceTimestamp: shipmentStatus === 'CLEARED_FOR_EXPORT' ? new Date().toISOString() : null,
    });
  };

  const handleRebuild = () => {
    buildBundle();
  };

  const mandatory = bundle.documents.filter((d) => d.mandatory);
  const optional = bundle.documents.filter((d) => !d.mandatory);
  const missingMandatory = mandatory.filter((d) => d.status === 'MISSING');

  const isCleared = bundle.shipmentStatus === 'CLEARED_FOR_EXPORT';
  const isBlocked = bundle.shipmentStatus === 'BLOCKED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[var(--cyan)] flex items-center justify-center flex-shrink-0">
          <Package size={20} className="text-[var(--cyan)]" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Step 7 — The Barrister&apos;s Bundle
          </h2>
          <p className="font-mono text-xs text-[var(--muted2)] mt-1">
            Complete Document Checklist & Pre-Shipment Release Gate
          </p>
        </div>
      </div>

      {/* Release Gate Status */}
      <AnimatePresence mode="wait">
        {isCleared && (
          <motion.div
            key="cleared"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgba(100,255,218,0.08)] border-2 border-[var(--cyan)] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--cyan)] flex items-center justify-center">
                <CheckCircle size={24} className="text-black" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-[var(--cyan)] uppercase tracking-wider">
                  CLEARED FOR EXPORT
                </p>
                <p className="font-mono text-xs text-[var(--muted2)]">
                  Pre-shipment release gate passed. All mandatory documents validated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-[var(--s3)] rounded-lg p-3">
                <p className="font-mono text-[10px] text-[var(--muted2)]">Clearance Certificate</p>
                <p className="font-mono text-sm font-bold text-[var(--cyan)]">
                  {bundle.clearanceCertificate}
                </p>
              </div>
              <div className="bg-[var(--s3)] rounded-lg p-3">
                <p className="font-mono text-[10px] text-[var(--muted2)]">Timestamp</p>
                <p className="font-mono text-sm text-[var(--text)]">
                  {bundle.clearanceTimestamp
                    ? new Date(bundle.clearanceTimestamp).toLocaleString()
                    : '—'}
                </p>
              </div>
              <div className="bg-[var(--s3)] rounded-lg p-3">
                <p className="font-mono text-[10px] text-[var(--muted2)]">Security</p>
                <p className="font-mono text-xs text-[var(--text)]">
                  SHA-256 signed · AES-256 vault
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--cyan)] text-black rounded-lg font-mono text-xs font-bold hover:bg-[var(--cyan-hover)] transition-colors">
                <Download size={14} />
                Download Bundle (ZIP)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-[var(--cyan)] text-[var(--cyan)] rounded-lg font-mono text-xs hover:bg-[rgba(100,255,218,0.08)] transition-colors">
                View Clearance Certificate
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--muted2)] rounded-lg font-mono text-xs hover:text-[var(--text)] transition-colors">
                Notify Freight Forwarder
              </button>
            </div>
          </motion.div>
        )}

        {isBlocked && (
          <motion.div
            key="blocked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgba(255,83,112,0.08)] border-2 border-[#ff5370] rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,83,112,0.2)] flex items-center justify-center">
                <XCircle size={24} className="text-[#ff5370]" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-[#ff5370] uppercase tracking-wider">
                  SHIPMENT BLOCKED
                </p>
                <p className="font-mono text-xs text-[var(--muted2)]">
                  Critical compliance failure. Resolve blocking items before export.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!isCleared && !isBlocked && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[rgba(255,209,102,0.06)] border border-[rgba(255,209,102,0.3)] rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-[#ffd166]" />
              <div>
                <p className="font-mono text-sm font-bold text-[#ffd166]">
                  PENDING — {missingMandatory.length} mandatory document{missingMandatory.length !== 1 ? 's' : ''} missing
                </p>
                <p className="font-mono text-xs text-[var(--muted2)] mt-0.5">
                  Complete all mandatory documents to obtain shipment clearance.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Docs', val: bundle.documents.length, color: 'text-[var(--text)]' },
          { label: 'Validated', val: bundle.documents.filter((d) => d.status === 'VALIDATED').length, color: 'text-[var(--cyan)]' },
          { label: 'Missing', val: bundle.documents.filter((d) => d.status === 'MISSING').length, color: 'text-[#ff5370]' },
          { label: 'Not Required', val: bundle.documents.filter((d) => d.status === 'NOT_REQUIRED').length, color: 'text-[var(--muted2)]' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-3 text-center">
            <p className={`font-display text-2xl font-bold ${color}`}>{val}</p>
            <p className="font-mono text-[10px] text-[var(--muted2)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Mandatory Documents */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Mandatory Documents
          </h3>
          <button
            onClick={handleRebuild}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--muted2)] hover:text-[var(--cyan)] transition-colors"
          >
            <RefreshCw size={12} />
            Rebuild
          </button>
        </div>

        <div className="space-y-2">
          {mandatory.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onMarkValidated={handleMarkValidated} />
          ))}
        </div>
      </div>

      {/* Optional / Conditional Documents */}
      {optional.length > 0 && (
        <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-4">
            Conditional Documents
          </h3>
          <div className="space-y-2">
            {optional.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onMarkValidated={handleMarkValidated} />
            ))}
          </div>
        </div>
      )}

      {/* Pre-shipment conditions */}
      <div className="bg-[var(--s1)] border border-[var(--border)] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-[#ffd166]" />
          <h3 className="font-display text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Pre-Shipment Release Conditions
          </h3>
        </div>
        <div className="space-y-2">
          {[
            { condition: 'Commercial Invoice present', ok: bundle.documents.find((d) => d.id === 'commercial_invoice')?.status === 'VALIDATED' },
            { condition: 'Packing List present', ok: bundle.documents.find((d) => d.id === 'packing_list')?.status === 'VALIDATED' },
            { condition: 'CDS MRN obtained', ok: bundle.documents.find((d) => d.id === 'cds_mrn')?.status === 'VALIDATED' },
            { condition: 'MTC verified & cleared', ok: bundle.documents.find((d) => d.id === 'mtc')?.status === 'VALIDATED' },
            { condition: 'Sanctions screening cleared', ok: bundle.documents.find((d) => d.id === 'sanctions_cert')?.status === 'VALIDATED' },
            { condition: 'TCA origin declaration signed (if applicable)', ok: bundle.documents.find((d) => d.id === 'statement_on_origin')?.status !== 'MISSING' },
            { condition: 'CBAM data complete (if applicable)', ok: bundle.documents.find((d) => d.id === 'cbam_cert')?.status !== 'MISSING' },
          ].map(({ condition, ok }) => (
            <div key={condition} className="flex items-center gap-3">
              {ok ? (
                <CheckCircle size={14} className="text-[var(--cyan)] flex-shrink-0" />
              ) : (
                <XCircle size={14} className="text-[#ff5370] flex-shrink-0" />
              )}
              <span className={`font-mono text-xs ${ok ? 'text-[var(--text)]' : 'text-[var(--muted2)]'}`}>
                {condition}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isCleared && (
        <div className="bg-[rgba(0,0,0,0.2)] border border-[var(--border)] rounded-lg p-4">
          <p className="font-mono text-xs text-[var(--muted2)]">
            <span className="text-[var(--cyan)]">Next steps:</span> ZIP bundle stored in S3 with AES-256
            encryption · Veritariff Clearance Certificate timestamped + SHA-256 signed · Notify exporter,
            freight forwarder &amp; German importer.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--muted2)] rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:border-[var(--border2)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--muted2)] rounded-lg font-display text-sm font-bold uppercase tracking-wider hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
        >
          <RefreshCw size={16} />
          New Shipment
        </button>
      </div>
    </div>
  );
};
