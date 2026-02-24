"use client";
import { motion } from 'framer-motion';
import { Code, Globe, Shield, DollarSign, Ship, Percent } from 'lucide-react';

const features = [
  { icon: Code, title: "HS Code Intelligence", desc: "Validate and classify goods with AI-powered suggestions." },
  { icon: Globe, title: "Rules of Origin Engine", desc: "Automatically apply preferential rates from trade agreements." },
  { icon: Shield, title: "Anti-Dumping Detection", desc: "Avoid costly surprises by flagging AD/CVD measures." },
  { icon: DollarSign, title: "Official Customs FX", desc: "Use the exact exchange rates published by HMRC and ECB." },
  { icon: Ship, title: "Incoterm Simulation", desc: "Model costs across different Incoterms to optimize sourcing." },
  { icon: Percent, title: "VAT & Deferment Logic", desc: "Accurately calculate import VAT and model deferment accounts." },
];

export const FeatureGrid = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4">
      <h2 className="text-center text-4xl font-bold text-text-primary tracking-tight">An Institutional-Grade Calculation Engine</h2>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div 
            key={feature.title}
            className="p-6 rounded-xl border border-border-default bg-bg-surface/40 transition-all duration-300 hover:bg-bg-surface/80 hover:-translate-y-1"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <feature.icon className="w-8 h-8 text-brand-primary" />
            <h3 className="mt-4 font-semibold text-text-primary">{feature.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
