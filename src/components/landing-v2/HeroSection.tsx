"use client";
import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 50, damping: 20 }
  },
};

const eyebrowLineVariants = {
  hidden: { width: 0 },
  visible: { width: 36, transition: { duration: 0.8, ease: "easeOut" } }
};

const STATS = [
  { figure: "£13B", label: "lost by UK businesses at borders annually", color: "#ff5370" },
  { figure: "23%", label: "drop in UK exports to EU since Brexit", color: "#B7770D" },
  { figure: "66%", label: "of businesses report border delays raising costs", color: "#B7770D" },
  { figure: "€100/t", label: "CBAM penalty per excess tonne not surrendered", color: "#ff5370" },
  { figure: "$550B", label: "of goods hit by US Section 301 tariffs on China", color: "#ff5370" },
  { figure: "$220B", label: "intra-African trade in 2026, growing 12.4% YoY", color: "#64FFDA" },
];

const StatTicker = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % STATS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const stat = STATS[index];

  return (
    <div className="absolute top-4 right-4 md:right-10 md:top-10 bg-[#112240]/90 backdrop-blur border border-[#233554] px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(100,255,218,0.1)] animate-float-delayed z-20 max-w-xs">
      <div className="w-2 h-2 rounded-full bg-[#64FFDA] animate-pulse flex-shrink-0" />
      <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <span className="font-mono font-bold text-sm" style={{ color: stat.color }}>{stat.figure}</span>
        <span className="text-slate-400 text-xs ml-2 hidden sm:inline">{stat.label}</span>
      </div>
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 scanline-overlay z-10" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#64FFDA] opacity-[0.05] blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#64FFDA] opacity-[0.05] blur-[120px] rounded-full animate-float-delayed" />
        <div className="absolute top-1/4 left-10 w-4 h-4 bg-[#64FFDA]/20 rounded-full blur-sm animate-float" />
        <div className="absolute bottom-1/3 right-10 w-6 h-6 bg-[#64FFDA]/10 rounded-full blur-sm animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <StatTicker />

        <motion.div
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div variants={eyebrowLineVariants} className="h-[1px] bg-[#64FFDA]" />
            <motion.span
              variants={itemVariants}
              className="text-[#64FFDA] font-mono text-sm tracking-wider uppercase inline-block"
              style={{ letterSpacing: '0.1em' }}
            >
              THE TRADE COMPLIANCE OS FOR SMEs
            </motion.span>
            <motion.div variants={eyebrowLineVariants} className="h-[1px] bg-[#64FFDA]" />
          </div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6"
          >
            We stop companies from <br className="hidden md:block" />
            <span className="relative inline-block group">
              <span className="text-[#ff5370]">
                bleeding profit
              </span>
              {" "}at the border.
            </span>
          </motion.h1>

          {/* Subheader */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The last time the world re-bilateralised like this, global trade collapsed by 66%. Today: CBAM, safeguard duties, forced labour laws, and 54 African nations opening simultaneously. Veritariff is the intelligence layer that turns regulatory complexity into competitive advantage — for every SME that moves goods across borders.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="#how-it-works"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent border border-[#64FFDA]/50 rounded-lg hover:border-[#64FFDA] hover:bg-[#64FFDA]/10 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#64FFDA] focus:ring-offset-[#0A192F]"
            >
              <span className="mr-2">See how it works</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="btn-sweep group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#0A192F] transition-all duration-200 bg-[#64FFDA] rounded-lg hover:bg-[#4cdbb5] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#64FFDA] focus:ring-offset-[#0A192F]"
            >
              <span className="mr-2">Start free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-3xl grid grid-cols-3 gap-3"
          >
            {STATS.slice(0, 3).map((s) => (
              <motion.div
                key={s.figure}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="p-4 bg-[#112240]/80 backdrop-blur-sm border border-[#233554] rounded-xl text-center"
              >
                <div className="font-mono font-bold text-xl md:text-2xl mb-1" style={{ color: s.color }}>{s.figure}</div>
                <div className="text-slate-500 text-xs leading-tight">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
