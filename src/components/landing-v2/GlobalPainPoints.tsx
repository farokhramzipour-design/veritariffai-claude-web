"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PAIN_POINTS = [
  {
    corridor: "UK ↔ EU", flag: "🇬🇧↔🇪🇺", color: "#185FA5",
    headline: "The most expensive political divorce in trade history",
    stat: "£469M", statLabel: "in new annual compliance costs for UK businesses",
    source: "NAO, 2024",
    pains: [
      { label: "CBAM: a hidden €100/t penalty", detail: "EU carbon border tax definitive from January 2026. BF-BOF default = ~2 tCO₂/t. Actual EAF = ~0.36 tCO₂/t. Importers using defaults overpay by up to 10×." },
      { label: "TRQ blindness", detail: "UK country-specific steel quotas. When exhausted, duty jumps 0%→25% (proposed 50% from July 2026). No platform alerts exporters. They find out at Hamburg." },
      { label: "66% hit by delays", detail: "66% of UK businesses report border delays directly raising costs. A 5-day hold on a perishable shipment doesn't delay the profit — it destroys it." },
      { label: "23% export drop", detail: "UK exports to the EU fell 23% post-Brexit. Not because demand collapsed — because compliance overhead made trade economically irrational for SMEs." },
    ]
  },
  {
    corridor: "US ↔ China", flag: "🇺🇸↔🇨🇳", color: "#C0392B",
    headline: "The world's biggest trade route — turned into a minefield",
    stat: "$550B", statLabel: "of goods hit by Section 301 tariffs",
    source: "USTR / China Briefing, 2025",
    pains: [
      { label: "Tariff whiplash", detail: "US tariffs on Chinese goods peaked at 127% in May 2025 before partial rollback. Businesses priced contracts at 25% — woke up to 145% overnight. Zero automated alert systems exist." },
      { label: "Entity List blindspot", detail: "BIS Entity List: 1,800+ Chinese entities. Updates with zero notice. Most companies do quarterly batch checks. A supplier cleared Monday can be sanctioned Friday — your shipment is already at sea." },
      { label: "UFLPA seizures", detail: "$1.73B in goods seized in 2024 under Uyghur Forced Labour Prevention Act. Rebuttable presumption: any Xinjiang-origin goods presumed illegal unless proven otherwise." },
      { label: "$24B soybean wipeout", detail: "China's share of US soybean exports dropped from 62% to 18% in 2017–18. Farmers lost $24B in exports — not from a bad harvest. From a tariff war they couldn't see coming." },
    ]
  },
  {
    corridor: "EU ↔ Africa", flag: "🇪🇺↔🌍", color: "#B7770D",
    headline: "The largest free trade area on earth — that almost no one can use",
    stat: "15%", statLabel: "intra-African trade vs 60%+ in Europe",
    source: "Brookings / AfCFTA Secretariat, 2025",
    pains: [
      { label: "126-hour customs dwell time", detail: "Average customs clearance time in Sub-Saharan Africa: 126 hours. OECD average: 1–2 days. For perishables, this isn't a delay — it's a death sentence for the shipment." },
      { label: "42 currencies, no settlement", detail: "AfCFTA covers 54 nations and 42 currencies. PAPSS is live but has low private-sector adoption. Most cross-border payments still route through New York, adding 3–5 days and FX cost." },
      { label: "Incomplete rules of origin", detail: "AfCFTA RoO negotiations are incomplete for key product categories. An exporter cannot claim preferences until their specific product's rules are finalised — and the schedule varies by country." },
      { label: "$100B trade finance gap", detail: "$100B trade finance gap specifically blocks African SME cross-border trade. Banks can't assess credit risk because no standardised digital documentation exists." },
    ]
  },
  {
    corridor: "Australia ↔ Asia-Pacific", flag: "🇦🇺↔🌏", color: "#0F6E56",
    headline: "World-class products. World's strictest biosecurity. World's worst paperwork.",
    stat: "A$11,400", statLabel: "average annual compliance leakage per SME exporter",
    source: "Veritariff analysis, 2025",
    pains: [
      { label: "DAFF zero-tolerance", detail: "Australia's biosecurity authority can re-export your machinery at your cost if a single soil particle is found. New field-tested equipment requires an Import Permit. No software automates the pre-documentation." },
      { label: "JAEPA preference losses", detail: "JAEPA delivers near-zero tariffs — but Australian exporters routinely lose the preference at Japanese clearance by mis-formatting the EDI declaration for Japan's NACCS system." },
      { label: "Illegal Logging Act 2024", detail: "Effective March 2025. Enhanced due diligence required on timber sourcing. New documentation requirements not yet integrated into any freight forwarder's workflow." },
      { label: "Japanese SPS rejection", detail: "Japan's Food Labelling Act requires Japanese-language nutrition labels. Australian exporters producing English-only docs face rejection at Yokohama — re-labelling in Tokyo: A$2,200 average cost." },
    ]
  },
  {
    corridor: "Global picture", flag: "🌐", color: "#534AB7",
    headline: "The number that puts it all in perspective",
    stat: "$1.9T", statLabel: "estimated global GDP loss from US-China tariff escalation 2024–28",
    source: "Oxford Economics / US-China Business Council, 2023",
    pains: [
      { label: "Trade compliance market: $5B, serving multinationals only", detail: "Global trade compliance software market is $5B in 2025 at 12% CAGR. Every major player — SAP, Oracle, Descartes — serves large enterprises. SMEs get spreadsheets." },
      { label: "$1.3B bank fine for compliance failure", detail: "A major US bank settled at $1.3B for lapses in third-party due diligence facilitating illicit trade. The burden of proof is now entirely on businesses." },
      { label: "UFLPA: $1.73B seized in 2024", detail: "Enforcement is accelerating. No freight forwarder currently screens supply chains in real time against the UFLPA." },
      { label: "WiseTech acquires e2open for $2.1B", detail: "August 2025: largest M&A deal in trade compliance history. The category is consolidating around enterprise. Nobody is building for SMEs." },
    ]
  },
];

export const GlobalPainPoints = () => {
  const [active, setActive] = useState(0);
  const [expandedPain, setExpandedPain] = useState<string | null>(null);

  const p = PAIN_POINTS[active];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Every corridor. Every pain point. <br />
            <span className="text-red-600">All sourced.</span>
          </h2>
          <p className="text-slate-500 text-lg">Select a trade corridor to see the specific compliance challenges your business faces.</p>
        </motion.div>

        {/* Corridor tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {PAIN_POINTS.map((pp, i) => (
            <button
              key={pp.corridor}
              onClick={() => { setActive(i); setExpandedPain(null); }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border"
              style={{
                background: active === i ? `${pp.color}15` : '#f8fafc',
                borderColor: active === i ? pp.color : '#e2e8f0',
                color: active === i ? pp.color : '#64748b',
              }}
            >
              {pp.flag} {pp.corridor}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header card */}
            <div
              className="rounded-2xl p-6 mb-6 border-l-4"
              style={{
                background: `${p.color}08`,
                border: `1px solid ${p.color}30`,
                borderLeft: `4px solid ${p.color}`,
              }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.color }}>
                    {p.flag} {p.corridor}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight max-w-lg">{p.headline}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-4xl font-bold leading-none mb-1" style={{ color: p.color }}>{p.stat}</div>
                  <div className="text-sm text-slate-500 max-w-[180px] leading-tight">{p.statLabel}</div>
                  <div className="text-xs text-slate-400 mt-1 italic">{p.source}</div>
                </div>
              </div>
            </div>

            {/* Pain point cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {p.pains.map((pain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border cursor-pointer transition-all duration-200"
                  style={{
                    background: expandedPain === `${active}-${i}` ? `${p.color}08` : '#f8fafc',
                    borderColor: expandedPain === `${active}-${i}` ? p.color : '#e2e8f0',
                  }}
                  onClick={() => setExpandedPain(expandedPain === `${active}-${i}` ? null : `${active}-${i}`)}
                >
                  <div className="flex items-center justify-between p-4">
                    <span className="font-semibold text-slate-900 text-sm">{pain.label}</span>
                    <ChevronDown
                      className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                      style={{
                        color: p.color,
                        transform: expandedPain === `${active}-${i}` ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedPain === `${active}-${i}` && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-slate-600 leading-relaxed px-4 pb-4">{pain.detail}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
