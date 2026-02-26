"use client";
import { motion } from 'framer-motion';
import { Ship, Search, ArrowRight, Activity } from 'lucide-react';
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

const Ticker = () => {
  const [value, setValue] = useState(12450);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setValue(prev => {
          const variations = [12450, 11200, 13800, 10500, 14100];
          const nextIndex = (variations.indexOf(prev) + 1) % variations.length;
          return variations[nextIndex];
        });
        setVisible(true);
      }, 300); // Wait for fade out
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 md:right-10 md:top-10 bg-[#112240]/90 backdrop-blur border border-[#64FFDA]/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(100,255,218,0.15)] animate-float-delayed z-20">
      <div className="w-2 h-2 rounded-full bg-[#64FFDA] animate-pulse" />
      <span className="text-xs text-slate-400 font-mono">LIVE DUTY SAVINGS:</span>
      <span className={`text-[#64FFDA] font-mono font-bold transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        £{value.toLocaleString()}
      </span>
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Removed opaque background to show global canvas */}
        {/* Scanline Overlay */}
        <div className="absolute inset-0 scanline-overlay z-10" />
        
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#64FFDA] opacity-[0.05] blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#64FFDA] opacity-[0.05] blur-[120px] rounded-full animate-float-delayed" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-10 w-4 h-4 bg-[#64FFDA]/20 rounded-full blur-sm animate-float" />
        <div className="absolute bottom-1/3 right-10 w-6 h-6 bg-[#64FFDA]/10 rounded-full blur-sm animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <Ticker />
        
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
              whileInView={{ letterSpacing: '0.05em', transition: { duration: 1 } }}
            >
              THE TRADE COMPLIANCE OS
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
            Global trade is a data minefield. Veritariff is the central hub to simulate profit margins, automate customs workflows, and instantly clear sanctions.
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="mb-16">
            <Link href="/calculator" className="btn-sweep group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#0A192F] transition-all duration-200 bg-[#64FFDA] rounded-lg hover:bg-[#4cdbb5] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#64FFDA] focus:ring-offset-[#0A192F]">
              <span className="mr-2">Try calculator for free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </Link>
          </motion.div>

          {/* User Segmentation Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-6 w-full max-w-3xl"
          >
            {/* Card 1: I move goods */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="group relative p-6 bg-[#112240]/80 backdrop-blur-sm border border-[#233554] rounded-xl hover:border-[#64FFDA] transition-all duration-300 hover:-translate-y-2 cursor-pointer text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#64FFDA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#64FFDA] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-[#64FFDA]" />
              </div>

              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 bg-[#0A192F] rounded-lg border border-[#233554] group-hover:border-[#64FFDA]/50 transition-colors">
                  <Ship className="w-8 h-8 text-[#64FFDA]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#64FFDA] transition-colors">I move goods</h3>
                  <p className="text-sm text-slate-400">For importers, exporters, and SMEs optimizing supply chains.</p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: I am a researcher */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="group relative p-6 bg-[#112240]/80 backdrop-blur-sm border border-[#233554] rounded-xl hover:border-[#64FFDA] transition-all duration-300 hover:-translate-y-2 cursor-pointer text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#64FFDA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#64FFDA] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-[#64FFDA]" />
              </div>

              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 bg-[#0A192F] rounded-lg border border-[#233554] group-hover:border-[#64FFDA]/50 transition-colors">
                  <Search className="w-8 h-8 text-[#64FFDA]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#64FFDA] transition-colors">I am a researcher</h3>
                  <p className="text-sm text-slate-400">For academics, lawyers, and students exploring trade data.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
