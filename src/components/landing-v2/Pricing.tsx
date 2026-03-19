"use client";
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PRICING = [
  {
    stream: "01", tag: "SAAS_CORE", name: "Standard Workspace", price: "£2,500", period: "/mo",
    color: "#185FA5", highlight: false,
    desc: "Full OS with template workflows your team amends to fit your structure.",
    features: [
      "HS Code Classification Wizard",
      "Duty & RoO Engine",
      "Automated Sanctions Screen",
      "Statement on Origin Generator",
      "CBAM SEE Calculator",
      "Automated Audit Vault",
      "1 active trade corridor",
      "Up to 50 shipments/month",
      "Email support",
    ],
    roi: "Pays for itself on the first CBAM default penalty avoided.",
    cta: "Get started",
    ctaHref: "/login",
  },
  {
    stream: "02", tag: "SAAS_ENTERPRISE", name: "Corporate Custom", price: "£4,500", period: "/mo",
    color: "#0F6E56", highlight: true, badge: "MOST POPULAR",
    desc: "Specialist-led. We build a 100% customised workflow for your business.",
    features: [
      "Everything in Standard",
      "Multi-entity governance",
      "Unlimited corridors",
      "Unlimited shipments",
      "MTC Auto-Auditor (AI PDF validation)",
      "TRQ Quota Alert Dashboard — live",
      "Barrister's Bundle + Clearance Certificate",
      "AEO Pipeline Builder",
      "Priority portal + dedicated compliance manager",
      "Custom API integration",
    ],
    roi: "£18,000+/month in recovered margin for a 200-shipment/month exporter.",
    cta: "Contact sales",
    ctaHref: "/login",
  },
  {
    stream: "03", tag: "INFRASTRUCTURE", name: "API Integration", price: "£0.15", period: "/call",
    color: "#534AB7", highlight: false,
    desc: "For freight forwarders and brands needing real-time Landed Cost API integration.",
    features: [
      "Real-time landed cost endpoint",
      "Live TARIC + UKGT duty rates",
      "Sanctions screen API (per entity)",
      "CBAM cost estimator",
      "TRQ quota balance endpoint",
      "99.99% SLA uptime",
      "Webhook support",
      "Direct customs portal connectivity",
    ],
    roi: "Used by freight forwarders to embed compliance into booking flows.",
    cta: "View API docs",
    ctaHref: "#",
  },
  {
    stream: "04", tag: "MARKETPLACE", name: "Brand DPPs", price: "Custom", period: "/tier",
    color: "#854F0B", highlight: false,
    desc: "Digital Product Passports for circular economy and CBAM compliance.",
    features: [
      "Cryptographically signed Digital Product Passport",
      "CBAM embedded emissions certificate",
      "Supply chain provenance record",
      "Sustainability verification",
      "EU DPP regulation ready",
      "Share with buyers, banks, insurers",
      "Brand-labelled passport portal",
    ],
    roi: "Required under incoming EU Digital Product Passport regulation.",
    cta: "Talk to us",
    ctaHref: "#",
  },
  {
    stream: "05", tag: "TRADE_HUB", name: "Trade Hub", price: "£150", period: "/mo + 1.5% match",
    color: "#993C1D", highlight: false, badge: "NEW",
    desc: "Connect exporters to verified buyers globally. List, bid, match, comply — all in one flow.",
    features: [
      "List goods: code, volume, origin, price range",
      "Instant buyer notification in destination market",
      "Bidding engine: importers offer, exporter selects",
      "On match: auto-routed into full compliance workflow",
      "Buyer EORI/REX/VAT verified automatically",
      "Shipment timeline shared with both parties live",
      "Barrister's Bundle auto-generated on match",
      "1.5% success fee on completed shipments only",
    ],
    roi: "List your goods. Verified buyers bid. You accept. Veritariff handles the rest.",
    cta: "Join the hub",
    ctaHref: "/login",
  },
];

export const Pricing = () => (
  <section className="py-20 lg:py-32 bg-[#0A192F] relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#64FFDA] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        className="text-center max-w-3xl mx-auto mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-[#64FFDA] font-mono text-sm tracking-widest mb-4 uppercase">{'// Pricing'}</div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Monetising Strategy, Execution,<br />
          <span className="text-slate-400">and Infrastructure Across the Trade Stack.</span>
        </h2>
        <p className="text-slate-400 text-lg">Stop paying £50k for consultants. Start with Veritariff.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRICING.map((p, i) => (
          <motion.div
            key={p.stream}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: '#060e1e',
              border: `1px solid ${p.highlight ? `${p.color}60` : `${p.color}25`}`,
              boxShadow: p.highlight ? `0 0 30px ${p.color}15` : 'none',
            }}
          >
            {p.badge && (
              <div
                className="text-center py-1.5 text-xs font-bold tracking-widest text-white"
                style={{ background: p.color }}
              >
                {p.badge}
              </div>
            )}

            <div className="p-6">
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: p.color }}>
                STREAM_{p.stream}: {p.tag}
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-mono font-bold text-3xl" style={{ color: p.color }}>{p.price}</span>
                <span className="text-slate-500 text-sm">{p.period}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 pb-5 border-b border-[#1e3a5f]">{p.desc}</p>

              <ul className="space-y-2 mb-5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-slate-400 leading-snug">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.color }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div
                className="text-xs italic p-3 rounded-lg mb-5"
                style={{ background: `${p.color}12`, borderLeft: `2px solid ${p.color}`, color: p.color }}
              >
                {p.roi}
              </div>

              <Link
                href={p.ctaHref}
                className="block w-full text-center py-3 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:opacity-90"
                style={{
                  background: p.highlight ? p.color : `${p.color}20`,
                  color: p.highlight ? '#fff' : p.color,
                  border: `1px solid ${p.color}40`,
                }}
              >
                {p.cta}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
