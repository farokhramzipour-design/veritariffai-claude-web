"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FinalCta = () => (
  <section className="py-20 lg:py-32 text-center bg-[#0A192F] relative overflow-hidden">
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#64FFDA] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"
      animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
      className="container mx-auto px-4 relative z-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="text-[#64FFDA] font-mono text-sm tracking-widest mb-4 uppercase">
        // Veritariff — The Trade Compliance OS for SMEs
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
        Stop bleeding profit at the border. <br />
        <span className="text-[#64FFDA]">Start controlling your trade.</span>
      </h2>
      <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
        HS classification, duties, sanctions, CBAM, customs declarations, and the Barrister's Bundle — in one platform.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="#how-it-works"
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent border border-[#64FFDA]/50 rounded-lg hover:border-[#64FFDA] hover:bg-[#64FFDA]/10 hover:scale-105 hover:-translate-y-1 focus:outline-none"
        >
          <span className="mr-2">See how it works</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/login"
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#0A192F] transition-all duration-300 bg-[#64FFDA] rounded-lg hover:bg-[#4cdbb5] hover:scale-105 hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] focus:outline-none overflow-hidden"
        >
          <span className="mr-2 relative z-10">Start free</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 relative z-10" />
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
        </Link>
      </div>
    </motion.div>
  </section>
);
