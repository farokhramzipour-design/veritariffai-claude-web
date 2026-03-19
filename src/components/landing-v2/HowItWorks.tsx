"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const STEPS = [
  {
    step: "01", title: "Enter your goods", subtitle: "Classification Wizard",
    color: "#185FA5", bg: "#E6F1FB",
    what: "AI asks guided questions — chemical composition, physical form, intended use — and outputs the 10-digit commodity code.",
    developer: [
      "Dropdown: chemical composition tree (waste→7204, pig iron→7201, other alloy→7224 etc.)",
      "Conditional sub-dropdown: physical form per alloy class",
      "Call Trade Tariff API: api.trade-tariff.service.gov.uk for live 10-digit code + flags",
      "Pre-check gate: if code already in session → skip wizard, green tick",
      "Save: classification_id, supplementary_units, regulatory_flags to shipment object",
    ],
    outcome: "10-digit HS code confirmed. Regulatory flags raised (CBAM, TRQ, sanctions risk).",
  },
  {
    step: "02", title: "Know your duties", subtitle: "Duty & RoO Engine",
    color: "#0F6E56", bg: "#E1F5EE",
    what: "Platform calculates all applicable duties — MFN, TCA preferential rate, EU steel safeguard TRQ, CBAM carbon cost — and shows the financial delta between claiming and not claiming preferences.",
    developer: [
      "MFN gateway: fetch live MFN from Trade Tariff API. If 0% AND origin ≠ RU → 'Duty Free'",
      "TCA RoO engine: PSR checker for HS code. For 7224: CTH rule — flag melt+pour requirement",
      "Safeguard TRQ: fetch live Category 26 quota balance from EU TARIC daily. Alert at 25% remaining",
      "If TRQ exhausted → display 25% current / 50% proposed Jul 2026 + decision modal",
      "CBAM calculator: if EU importer >50t/year → collect production route → SEE calc → show cost vs default penalty",
    ],
    outcome: "Exact duty liability calculated. CBAM cost vs verified-data saving shown in £. TRQ availability with live countdown.",
  },
  {
    step: "03", title: "Prove your origin", subtitle: "5-Method Origin Engine",
    color: "#534AB7", bg: "#EEEDFE",
    what: "Platform presents the right proof-of-origin method — from Statement on Origin to EUR.1 to Importer's Knowledge — and generates or validates the documentation automatically.",
    developer: [
      "Role gate: supplier / exporter / importer → route to correct method",
      "EUR.1: AI pre-fills C1299 from vault → user downloads → uploads stamped → AI verifies",
      "Statement on Origin: if existing → upload + AI verifies TCA Annex ORIG-4. If not → generate from packing list/invoice → attach EORI/REX",
      "Importer's Knowledge: collect commodity codes + production process. TCA Art.20 liability warning",
      "Auto-populate 'No cumulation applied' for UK→EU. Never leave blank.",
    ],
    outcome: "Proof of origin generated or validated. TCA Annex ORIG-4 wording confirmed. SHA-256 hashed.",
  },
  {
    step: "04", title: "Clear sanctions", subtitle: "Sanctions & Licence Gate",
    color: "#993C1D", bg: "#FAECE7",
    what: "Every party and every material is screened in real time. Russian melt origin blocked regardless of where processing occurred. Licence requirements checked automatically.",
    developer: [
      "Screen: exporter, consignee, end-user, melt-origin country vs OFSI / UN / OFAC / EU Consolidated List",
      "Hard block: if any party listed OR meltCountry = RU/BY → block with explanation",
      "SECL check: commodity on UK Strategic Export Control List? If yes → require SIEL/OIEL",
      "TARIC measures: fetch live. If V710 → warn EU importer must obtain prior surveillance doc",
      "MTC Auto-Auditor (AI): extract mill name, melt/pour country, heat number, composition → cross-ref vs classification → screen mill vs sanctions → check issue date ≤12 months",
    ],
    outcome: "All parties cleared. Melt origin verified. MTC validated. SHA-256 hash stored.",
  },
  {
    step: "05", title: "File your declaration", subtitle: "CDS Declaration Engine",
    color: "#3B6D11", bg: "#EAF3DE",
    what: "All 17 CDS Data Elements are auto-populated from the shipment object. EORI validated against HMRC live. EXS timing calculated per transport mode. MRN received on acceptance.",
    developer: [
      "Auto-populate all 17 DEs: DE1/10 (1040), DE3/1 (GB EORI via HMRC API), DE5/8 (DE), DE6/8 (10-digit), DE6/1 net mass, DE6/5 gross mass",
      "Currency: non-GBP → convert via HMRC weekly exchange rate",
      "EXS timing: RoRo ≥2h / Container ≥24h / Air ≥30min / AEO = waived. Alert at deadline minus 1 hour",
      "Licence attach: if licenceRef → attach to DE2/3 status 'EE'. If required but missing → block + redirect",
      "On HMRC acceptance → receive 18-char MRN → store + display",
    ],
    outcome: "CDS declaration accepted. MRN generated. EXS deadline set. Proof of export created for VAT zero-rating.",
  },
  {
    step: "06", title: "Release the bundle", subtitle: "The Barrister's Bundle",
    color: "#854F0B", bg: "#FAEEDA",
    what: "All mandatory documents validated. Cryptographically signed Clearance Certificate generated. AES-256 bundle delivered to all three parties simultaneously.",
    developer: [
      "Document vault: accept commercial invoice, packing list, MTC, MRN, sanctions clear. SHA-256 hash each on upload",
      "Release gate: ALL mandatory docs VALIDATED + TCA declaration signed + CBAM complete → CLEARED_FOR_EXPORT",
      "If any mandatory doc missing → show specific blocker with resolution instructions",
      "On CLEARED: generate Veritariff Clearance Certificate (SHA-256 signed, timestamped, all doc hashes)",
      "Bundle → AES-256 encrypted ZIP → Supabase Storage",
      "Notify: exporter + freight forwarder + DE importer simultaneously",
    ],
    outcome: "Clearance Certificate issued. Bundle delivered. Trade finance window: 48 hours vs 2 weeks standard.",
  },
];

const TIMELINE = [
  ["Classify", "~2min", "#185FA5"],
  ["Duties", "~3min", "#0F6E56"],
  ["Origin", "~5min", "#534AB7"],
  ["Sanctions", "~1min", "#993C1D"],
  ["CDS", "~4min", "#3B6D11"],
  ["Bundle", "~instant", "#854F0B"],
];

export const HowItWorks = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-[#0A192F] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#64FFDA] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-[#64FFDA] font-mono text-sm tracking-widest mb-4 uppercase">{'// How It Works'}</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            The Intelligence Layer <br />
            <span className="text-slate-400">Above Your Logistics.</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Full export cleared in under <span className="text-[#64FFDA] font-bold">15 minutes</span>.
          </p>
        </motion.div>

        <div className="space-y-3 mb-12">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <button
                className="w-full text-left"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div
                  className="flex gap-4 items-start p-4 rounded-xl border transition-all duration-200"
                  style={{
                    background: expanded === i ? `${s.color}10` : '#060e1e',
                    borderColor: expanded === i ? `${s.color}60` : '#1e3a5f',
                    borderLeft: `3px solid ${s.color}`,
                  }}
                >
                  <span className="font-mono text-2xl font-bold opacity-50 min-w-[2.5rem] leading-none pt-0.5" style={{ color: s.color }}>
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-semibold text-base">{s.title}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.subtitle}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{s.what}</p>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-200"
                    style={{ color: s.color, transform: expanded === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rounded-b-xl border border-t-0 p-5"
                      style={{ borderColor: `${s.color}30`, background: '#04080f' }}
                    >
                      <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: s.color }}>
                        Developer Implementation
                      </div>
                      <div className="space-y-2 mb-4">
                        {s.developer.map((d, j) => (
                          <div key={j} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                            <span style={{ color: s.color }} className="flex-shrink-0">→</span>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        className="p-3 rounded-lg border-l-2 text-sm"
                        style={{ background: `${s.color}10`, borderColor: s.color, color: s.color }}
                      >
                        <span className="font-bold text-xs uppercase tracking-wider">Output: </span>
                        {s.outcome}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Timeline bar */}
        <motion.div
          className="rounded-xl overflow-hidden border border-[#1e3a5f]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex">
            {TIMELINE.map(([label, time, color]) => (
              <div
                key={label as string}
                className="flex-1 py-3 text-center"
                style={{ background: `${color}12`, borderRight: `0.5px solid ${color}30` }}
              >
                <div className="text-sm font-bold" style={{ color: color as string }}>{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{time}</div>
              </div>
            ))}
          </div>
          <div className="text-center py-2 text-xs text-slate-500 bg-[#060e1e]">
            Full export cleared in under <span className="text-[#64FFDA] font-bold">15 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
