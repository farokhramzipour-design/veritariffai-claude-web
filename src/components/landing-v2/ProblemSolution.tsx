"use client";
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Clock } from 'lucide-react';

const problems = [
  {
    icon: AlertTriangle,
    color: "#ff5370",
    bgColor: "#ff537015",
    borderColor: "#ff537030",
    stat: "£469M",
    title: "£469M in new annual border costs since Brexit",
    body: "UK businesses face £469M in new compliance costs per year from post-Brexit border requirements alone — and that figure rises every time a new regulation lands.",
    source: "NAO, 2024",
  },
  {
    icon: Zap,
    color: "#B7770D",
    bgColor: "#B7770D15",
    borderColor: "#B7770D30",
    stat: "€100/t",
    title: "CBAM default values: a hidden €100/tonne penalty",
    body: "The EU's carbon border tax entered definitive enforcement in January 2026. Importers who can't supply verified emissions data face a €100 per excess tonne penalty. BF-BOF defaults overstate actual EAF emissions by up to 10×.",
    source: "EU Commission CBAM 2026; Coolset; O'Melveny Jan 2026",
  },
  {
    icon: Clock,
    color: "#B7770D",
    bgColor: "#B7770D15",
    borderColor: "#B7770D30",
    stat: "66%",
    title: "66% of businesses hit by border delays raising costs",
    body: "A 2024 Logistics UK survey found 66% of respondents reported border delays directly increasing transportation costs. For perishables, a single 5-day hold wipes the entire shipment margin.",
    source: "Logistics UK Survey, 2024",
  },
];

export const ProblemSolution = () => (
  <section className="py-20 lg:py-32 bg-white">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
          80% of SMEs manage border risk with Excel. <br />
          <span className="text-red-600">They are flying blind.</span>
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed">
          The cost of getting it wrong is no longer theoretical. Penalties, delays, and lost markets compound every quarter.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {problems.map((problem, i) => (
          <motion.div
            key={problem.title}
            className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300"
              style={{ background: problem.bgColor, border: `1px solid ${problem.borderColor}` }}
            >
              <problem.icon className="w-7 h-7" style={{ color: problem.color }} />
            </div>
            <div className="text-center mb-4">
              <span className="font-mono font-bold text-3xl" style={{ color: problem.color }}>{problem.stat}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 text-center leading-tight">{problem.title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm text-center">{problem.body}</p>
            <p className="text-xs text-slate-400 mt-3 text-center italic">Source: {problem.source}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
