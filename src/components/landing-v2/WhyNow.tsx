"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const WHY_NOW = [
  {
    icon: "1929", color: "#C0392B",
    headline: "History is repeating",
    oneliner: "The 1920s called. It wants its trade war back.",
    body: "Smoot-Hawley. Section 301. Brexit. CBAM. Every generation faces the same choice: cooperate or fragment. In the 1920s they fragmented. Trade collapsed 66%. We know how that ended. The difference this time: you can build the infrastructure that makes compliance cheap enough that businesses don't have to choose between going global and staying solvent.",
    stat: "66%", statLabel: "collapse in global trade, 1929–34",
    source: "Kindleberger, 'The World in Depression', 1986",
  },
  {
    icon: "2026", color: "#B7770D",
    headline: "The rules just got unmanageable",
    oneliner: "CBAM. UFLPA. Safeguard duties. 5 new US privacy laws. All in 18 months.",
    body: "Manual compliance is no longer a viable business strategy. January 2026 marked the shift from 'reporting' to 'enforcement'. The number of overlapping, technically demanding regulatory regimes now exceeds what any spreadsheet — or consultant — can track.",
    stat: "€100/t", statLabel: "CBAM penalty per excess tonne not surrendered",
    source: "EU Reg 2023/956; O'Melveny Jan 2026",
  },
  {
    icon: "NOW", color: "#0F6E56",
    headline: "New routes. No maps.",
    oneliner: "54 African nations. Vietnam. Indonesia. Malaysia. All open. All unserved.",
    body: "AfCFTA created the world's largest free trade area. Vietnam negotiated US tariffs from 46% to 20%. Indonesia, Malaysia, and Taiwan are being aligned as China+1 alternatives. These corridors are opening faster than any compliance platform can follow — and the businesses that move first win.",
    stat: "$3.4T", statLabel: "AfCFTA combined GDP — only 15% currently traded within Africa",
    source: "Brookings / AfCFTA Secretariat, 2025",
  },
  {
    icon: "AI", color: "#185FA5",
    headline: "AI makes it possible — for the first time",
    oneliner: "The work that cost £50k/year in consultants now takes 15 minutes.",
    body: "HS classification. Document validation. Sanctions screening. Emissions calculation. Origin declaration. A customs broker, trade lawyer, CBAM consultant, and sanctions specialist used to cost £50k/year. AI does all of it in the time it takes to upload a PDF. This is not incremental improvement. It is a category collapse.",
    stat: "15 min", statLabel: "from commodity description to clearance certificate",
    source: "Veritariff workflow analysis",
  },
];

export const WhyNow = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-32 bg-[#0A192F] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#64FFDA] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-[#64FFDA] font-mono text-sm tracking-widest mb-4 uppercase">{'// Why Now'}</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            The world is re-bilateralising. <br />
            <span className="text-slate-400">Your margins are paying for it.</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Four forces converging right now — that make doing nothing the riskiest option.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {WHY_NOW.map((c, i) => (
            <motion.div
              key={c.icon}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => setActive(active === i ? null : i)}
              className="rounded-xl border p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                background: active === i ? `${c.color}10` : '#060e1e',
                borderColor: active === i ? `${c.color}80` : `${c.color}30`,
                borderLeft: `3px solid ${c.color}`,
                boxShadow: active === i ? `0 0 20px ${c.color}15` : 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs font-bold px-3 py-1 rounded font-mono"
                  style={{ background: `${c.color}20`, color: c.color }}
                >
                  {c.icon}
                </span>
                <span className="text-white font-bold text-base">{c.headline}</span>
              </div>

              <p className="text-lg font-bold mb-3" style={{ color: c.color }}>{c.oneliner}</p>

              <AnimatePresence>
                {active === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-slate-400 text-sm leading-relaxed mb-4 overflow-hidden"
                  >
                    {c.body}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-mono text-2xl font-bold" style={{ color: c.color }}>{c.stat}</span>
                <span className="text-slate-400 text-xs leading-tight max-w-[160px]">{c.statLabel}</span>
              </div>
              <p className="text-slate-600 text-xs mt-1 italic">Source: {c.source}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
