"use client";
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { CalculationAnimation } from './CalculationAnimation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-glow-gradient opacity-30" />
      </div>
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center lg:text-left">
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-6xl font-bold tracking-tighter text-white leading-tight">
              Know Your Landed Cost. Before Customs Does.
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg lg:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0">
              Instant, transparent import & export cost calculation for UK and EU traders. Duties, VAT, anti-dumping, logistics — fully itemized.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="relative group px-8 py-3 font-semibold rounded-md bg-brand-blue text-white hover:opacity-90 transition-opacity">
                <span className="absolute inset-0 rounded-md bg-brand-blue blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-glow" />
                <span className="relative">Calculate Now →</span>
              </button>
              <button className="px-8 py-3 font-semibold rounded-md bg-navy-light text-white hover:bg-navy-lighter transition-colors">
                See How It Works
              </button>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-x-6 gap-y-3 justify-center lg:justify-start text-sm text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-blue" /> Used by 2,000+ trade professionals</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-blue" /> Built on official UK & EU data</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-brand-blue" /> Calculation accuracy target: 95%+</span>
            </motion.div>
          </div>
          <motion.div variants={itemVariants} className="relative h-96 lg:h-full">
            <CalculationAnimation />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
