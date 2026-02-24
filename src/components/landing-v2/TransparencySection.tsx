"use client";
import { motion } from 'framer-motion';

const FormulaLine = ({ text, value, isSub, isTotal, isFinal }: { text: string, value?: string, isSub?: boolean, isTotal?: boolean, isFinal?: boolean }) => (
  <div className={`flex justify-between items-center py-3 ${isTotal ? 'border-t border-border-default' : ''} ${isFinal ? 'mt-4' : ''}`}>
    <p className={`text-text-secondary text-sm sm:text-base ${isSub ? 'pl-4' : ''}`}>{text}</p>
    {value && <p className="font-mono text-text-primary text-sm sm:text-base">{value}</p>}
  </div>
);

export const TransparencySection = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Nothing Is Hidden.</h2>
      <p className="mt-4 text-base sm:text-lg text-text-secondary">We show you the exact formulas used to calculate your landed cost.</p>
      <motion.div 
        className="mt-12 max-w-2xl mx-auto bg-bg-surface/50 rounded-2xl border border-border-default p-6 sm:p-8 backdrop-blur-md text-left"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div className="divide-y divide-border-subtle">
          <FormulaLine text="Invoice Value" value="€10,000.00" />
          <FormulaLine text="+ Freight" value="€700.00" isSub />
          <FormulaLine text="+ Insurance" value="€80.00" isSub />
          <FormulaLine text="= Customs Value (CIF)" value="€10,780.00" isTotal />
        </div>
        <div className="divide-y divide-border-subtle mt-6">
          <FormulaLine text="Customs Value × Duty Rate (13.2%)" value="€1,422.96" isFinal />
          <FormulaLine text="(Customs Value + Duty) × VAT Rate (20%)" value="€2,440.59" />
          <FormulaLine text="= Total Taxes & Duties" value="€3,863.55" isTotal />
        </div>
      </motion.div>
    </div>
  </section>
);
