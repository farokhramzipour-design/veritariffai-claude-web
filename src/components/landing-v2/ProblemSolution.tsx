"use client";
import { motion } from 'framer-motion';

const CARDS = [
  {
    number: "$2.5T",
    label: "trade finance gap — the capital locked away from SMEs crossing borders",
    sub: "41% of SME trade finance applications are rejected. Multinationals: 7%. The Barrister\u2019s Bundle closes this gap.",
    source: "ADB Global Trade Finance Gap Survey, 2025",
    accent: "#ff5370",
    accentBg: "#ff537012",
    accentBorder: "#ff537030",
  },
  {
    number: "\u20AC100/t",
    label: "CBAM penalty per tonne — for every exporter still using default emissions values",
    sub: "Defaults overstate actual EAF steel emissions by up to 10\u00D7. On a single 500t shipment: a \u00A365,000 surprise.",
    source: "EU Reg 2023/956; O\u2019Melveny Jan 2026",
    accent: "#B7770D",
    accentBg: "#B7770D12",
    accentBorder: "#B7770D30",
  },
  {
    number: "76%",
    label: "reduction in customs clearance time with AEO status — from 168 hours to 41 hours",
    sub: "Demurrage payments drop 90%. Operating costs fall 57%. This green lane currently belongs to multinationals only.",
    source: "Nigeria Customs AEO Programme Report, 2025",
    accent: "#185FA5",
    accentBg: "#185FA512",
    accentBorder: "#185FA530",
  },
  {
    number: "3\u00D7",
    label: "value of your goods — the maximum HMRC penalty for a customs documentation error",
    sub: "HMRC audits go back 7 years. A \u00A3500,000 shipment with a paperwork mistake becomes a \u00A31.5M liability.",
    source: "CEMA 1979 s.68; Crowe UK, 2024",
    accent: "#ff5370",
    accentBg: "#ff537012",
    accentBorder: "#ff537030",
  },
];

export const ProblemSolution = () => (
  <section className="py-20 lg:py-32 bg-white">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          The cost of getting it wrong is no longer theoretical.
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed">
          These are not edge cases. They are the new normal for every business that crosses a border.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="rounded-2xl p-7 border"
            style={{
              background: card.accentBg,
              borderColor: card.accentBorder,
              borderLeft: `4px solid ${card.accent}`,
            }}
          >
            <div className="font-mono font-bold text-4xl mb-2" style={{ color: card.accent }}>
              {card.number}
            </div>
            <p className="font-semibold text-slate-900 text-base leading-snug mb-3">{card.label}</p>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">{card.sub}</p>
            <p className="text-xs text-slate-400 italic">Source: {card.source}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center text-slate-500 text-base max-w-2xl mx-auto"
      >
        Veritariff eliminates every one of these risks — in one workflow, in under 15 minutes.
      </motion.p>
    </div>
  </section>
);
