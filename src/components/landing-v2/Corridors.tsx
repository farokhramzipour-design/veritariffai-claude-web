"use client";
import { motion } from 'framer-motion';

const CORRIDORS = [
  { name: "UK \u2194 EU", status: "LIVE", color: "#0F6E56", flags: "\uD83C\uDDEC\uD83C\uDDE7\uD83C\uDDE9\uD83C\uDDEA\uD83C\uDDEB\uD83C\uDDF7\uD83C\uDDF3\uD83C\uDDF1\uD83C\uDDEE\uD83C\uDDF9\uD83C\uDDEA\uD83C\uDDF8", desc: "Full 7-step workflow. Steel, chemicals, agri-food. CBAM + TCA + CDS live." },
  { name: "UK \u2194 China", status: "Q3 2026", color: "#185FA5", flags: "\uD83C\uDDEC\uD83C\uDDE7\uD83C\uDDE8\uD83C\uDDF3", desc: "Section 301 engine. Entity List real-time screen. UFLPA chain tracing." },
  { name: "All AfCFTA Nations", status: "Q4 2026", color: "#B7770D", flags: "\uD83C\uDDF3\uD83C\uDDEC\uD83C\uDDFF\uD83C\uDDE6\uD83C\uDDF0\uD83C\uDDEA\uD83C\uDDEA\uD83C\uDDEC\uD83C\uDDEC\uD83C\uDDED\uD83C\uDDEC\uD83C\uDDED\uD83C\uDDE8\uD83C\uDDEE\uD83C\uDF0D", desc: "All 54 AfCFTA nations. RoO navigator. PAPSS payments. SPS engine." },
  { name: "UK \u2194 US", status: "Q1 2027", color: "#534AB7", flags: "\uD83C\uDDEC\uD83C\uDDE7\uD83C\uDDFA\uD83C\uDDF8", desc: "USMCA alignment. State privacy stack. Customs bond automation." },
  { name: "UK \u2194 Australia", status: "Q1 2027", color: "#993C1D", flags: "\uD83C\uDDEC\uD83C\uDDE7\uD83C\uDDE6\uD83C\uDDFA", desc: "DAFF biosecurity pre-docs. JAEPA EDI formatter. Timber due diligence." },
  { name: "Vietnam \u2194 EU", status: "Q2 2027", color: "#3B6D11", flags: "\uD83C\uDDFB\uD83C\uDDF3\uD83C\uDDE9\uD83C\uDDEA\uD83C\uDDEB\uD83C\uDDF7\uD83C\uDDEE\uD83C\uDDF9", desc: "EVFTA corridor. China+1 re-routing. CBAM for Vietnamese manufacturers." },
  { name: "UK \u2194 Japan", status: "Q2 2027", color: "#C0392B", flags: "\uD83C\uDDEC\uD83C\uDDE7\uD83C\uDDEF\uD83C\uDDF5", desc: "UKJCEPA. NACCS declaration formatting. Japanese SPS + food labelling." },
  { name: "Global \u2194 Global", status: "2028", color: "#4a5568", flags: "\uD83C\uDF10", desc: "Open API. Any corridor, any commodity. Veritariff as infrastructure." },
];

export const Corridors = () => (
  <section className="py-20 lg:py-32 bg-white">
    <div className="container mx-auto px-4">
      <motion.div
        className="text-center max-w-3xl mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          One platform. Every border.
        </h2>
        <p className="text-slate-500 text-lg">
          All corridors are bidirectional — exporting or importing, Veritariff handles both directions.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CORRIDORS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `${c.color}30`,
              borderLeft: `3px solid ${c.color}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900 text-sm">{c.name}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  background: c.status === 'LIVE' ? '#dcfce7' : '#f1f5f9',
                  color: c.status === 'LIVE' ? '#166534' : '#475569',
                }}
              >
                {c.status}
              </span>
            </div>
            <div className="text-2xl mb-3">{c.flags}</div>
            <p className="text-slate-500 text-xs leading-relaxed">{c.desc}</p>
            {c.status !== 'LIVE' && (
              <p className="text-xs mt-3 font-medium" style={{ color: c.color }}>
                \u2192 Notify me when live
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
