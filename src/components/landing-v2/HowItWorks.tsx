"use client";
import { motion } from 'framer-motion';

const STEPS = [
  {
    step: "01", title: "Enter your goods", subtitle: "Classification Wizard",
    color: "#185FA5", bg: "#E6F1FB",
    what: "AI asks guided questions — chemical composition, physical form, intended use — and outputs the 10-digit commodity code.",
  },
  {
    step: "02", title: "Know your duties", subtitle: "Duty & RoO Engine",
    color: "#0F6E56", bg: "#E1F5EE",
    what: "Platform calculates all applicable duties — MFN, TCA preferential rate, EU steel safeguard TRQ, CBAM carbon cost — and shows the financial delta between claiming and not claiming preferences.",
  },
  {
    step: "03", title: "Prove your origin", subtitle: "5-Method Origin Engine",
    color: "#534AB7", bg: "#EEEDFE",
    what: "Platform presents the right proof-of-origin method — from Statement on Origin to EUR.1 to Importer's Knowledge — and generates or validates the documentation automatically.",
  },
  {
    step: "04", title: "Clear sanctions", subtitle: "Sanctions & Licence Gate",
    color: "#993C1D", bg: "#FAECE7",
    what: "Every party and every material is screened in real time. Russian melt origin blocked regardless of where processing occurred. Licence requirements checked automatically.",
  },
  {
    step: "05", title: "File your declaration", subtitle: "CDS Declaration Engine",
    color: "#3B6D11", bg: "#EAF3DE",
    what: "All 17 CDS Data Elements are auto-populated from the shipment object. EORI validated against HMRC live. EXS timing calculated per transport mode. MRN received on acceptance.",
  },
  {
    step: "06", title: "Release the bundle", subtitle: "The Barrister's Bundle",
    color: "#854F0B", bg: "#FAEEDA",
    what: "All mandatory documents validated. Cryptographically signed Clearance Certificate generated. AES-256 bundle delivered to all three parties simultaneously.",
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

export const HowItWorks = () => (
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
            className="flex gap-4 items-start p-4 rounded-xl border"
            style={{
              background: '#060e1e',
              borderColor: '#1e3a5f',
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
