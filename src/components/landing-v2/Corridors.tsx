"use client";
import { motion } from 'framer-motion';

const CORRIDORS = [
  { name: "UK ↔ EU", status: "LIVE", color: "#0F6E56", flags: "🇬🇧🇩🇪🇫🇷🇳🇱🇮🇹🇪🇸", desc: "Full 7-step workflow. Steel, chemicals, agri-food. CBAM + TCA + CDS live." },
  { name: "UK ↔ China", status: "Q3 2026", color: "#185FA5", flags: "🇬🇧🇨🇳", desc: "Section 301 engine. Entity List real-time screen. UFLPA chain tracing." },
  { name: "All AfCFTA Nations", status: "Q4 2026", color: "#B7770D", flags: "🇳🇬🇿🇦🇰🇪🇪🇬🇬🇭🌍", desc: "All 54 AfCFTA nations. RoO navigator. PAPSS payments. SPS engine." },
  { name: "UK ↔ US", status: "Q1 2027", color: "#534AB7", flags: "🇬🇧🇺🇸", desc: "USMCA alignment. State privacy stack. Customs bond automation." },
  { name: "UK ↔ Australia", status: "Q1 2027", color: "#993C1D", flags: "🇬🇧🇦🇺", desc: "DAFF biosecurity pre-docs. JAEPA EDI formatter. Timber due diligence." },
  { name: "Vietnam ↔ EU", status: "Q2 2027", color: "#3B6D11", flags: "🇻🇳🇩🇪🇫🇷🇮🇹", desc: "EVFTA corridor. China+1 re-routing. CBAM for Vietnamese manufacturers." },
  { name: "UK ↔ Japan", status: "Q2 2027", color: "#C0392B", flags: "🇬🇧🇯🇵", desc: "UKJCEPA. NACCS declaration formatting. Japanese SPS + food labelling." },
  { name: "Global ↔ Global", status: "2028", color: "#4a5568", flags: "🌐", desc: "Open API. Any corridor, any commodity. Veritariff as infrastructure." },
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
          Trade Corridors
        </h2>
        <p className="text-slate-500 text-lg">
          All corridors are <span className="font-bold text-slate-700">↔ bidirectional</span>. One platform, any border.
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
                → Notify me when live
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
