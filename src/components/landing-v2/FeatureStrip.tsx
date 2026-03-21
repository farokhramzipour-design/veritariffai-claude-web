"use client";
import { motion } from 'framer-motion';

const COLUMNS = [
  {
    title: "Adjust your supply chain",
    pills: ["HS Classification", "Duty & RoO Engine", "Rules of Origin", "Sanctions Screen"],
  },
  {
    title: "Automate regulatory compliance",
    pills: ["CBAM Calculator", "CDS Declaration", "MTC Validation", "Barrister\u2019s Bundle"],
  },
  {
    title: "Connect globally",
    pills: ["Trade Hub", "Buyer matching", "Verified importers", "AEO Pipeline"],
  },
];

export const FeatureStrip = () => (
  <section className="bg-slate-50 border-y border-slate-200 py-12">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200"
      >
        {COLUMNS.map((col, i) => (
          <div key={col.title} className="px-6 py-6 md:py-2 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-4">{col.title}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {col.pills.map((pill) => (
                <motion.span
                  key={pill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="px-3 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm"
                >
                  {pill}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center text-slate-400 text-sm mt-8"
      >
        Full export cleared in under 15 minutes. From commodity code to cryptographically signed clearance certificate.
      </motion.p>
    </div>
  </section>
);
