"use client";
import { motion } from 'framer-motion';
import { BarChart3, ShieldCheck, QrCode, ArrowRight, CheckCircle, Globe } from 'lucide-react';

interface Solution {
  eyebrow?: string;
  title: string;
  description: string;
  tags?: string[];
  visual: React.ReactNode;
}

const solutions: Solution[] = [
  {
    eyebrow: "// 01 — STRATEGY ENGINE",
    title: "Pre-Shipment Margin Simulation",
    description: "Before a single container moves, model the true landed cost across every origin. Compare duty rates, freight scenarios, and tariff classifications to lock in your margin before you commit.",
    tags: ["HS Code AI", "Rules of Origin", "FX Integration", "Incoterm Modeling"],
    visual: (
      <div className="bg-[#0A192F] rounded-xl border border-[#233554] shadow-2xl w-full max-w-md overflow-hidden font-mono text-sm relative group">
        {/* Window Header */}
        <div className="bg-[#112240] px-4 py-3 border-b border-[#233554] flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-slate-400 text-xs">cost-comparison.vt</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#64FFDA] animate-pulse" />
            <span className="text-[#64FFDA] text-xs tracking-wider">COMPLETE</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[#0A192F]/80 backdrop-blur-sm">
          
          {/* Origin Comparison Rows */}
          <div className="space-y-4">
            {/* China Row */}
            <div className="flex justify-between items-center pb-4 border-b border-[#233554]">
              <span className="text-slate-400">Origin: China (CN)</span>
              <div className="text-right">
                <div className="bg-[#64FFDA]/10 border border-[#64FFDA]/30 rounded px-2 py-1 mb-1">
                  <span className="text-xs text-slate-400 block mb-0.5">POTENTIAL SAVING</span>
                  <span className="text-[#64FFDA] font-bold">-£4,450 (20%)</span>
                </div>
                <span className="text-red-400/60 line-through text-xs">£22,100</span>
              </div>
            </div>

            {/* Vietnam Row */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Origin: Vietnam (VN)</span>
              <span className="text-[#64FFDA] font-bold">£17,650</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#233554]/50">
            <div>
              <span className="text-slate-500 text-xs block mb-1">Duty Rate Δ</span>
              <div className="flex items-center gap-2 text-slate-300">
                <span>15.4%</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-[#64FFDA]">5.1%</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-xs block mb-1">Total Saving</span>
              <span className="text-[#64FFDA] font-bold">-£4,450 (20%)</span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">CN Total Landed</span>
                <span className="text-slate-400">88%</span>
              </div>
              <div className="h-1.5 bg-[#112240] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "88%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-red-400/80 rounded-full"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">VN Total Landed</span>
                <span className="text-slate-400">62%</span>
              </div>
              <div className="h-1.5 bg-[#112240] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "62%" }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-[#64FFDA] rounded-full"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  },
  {
    title: "The Compliance Shield",
    description: "AI sanctions scanning and VIES VAT validation. Automatically screen every entity and clear goods instantly.",
    visual: (
      <div className="bg-[#112240] p-6 rounded-xl border border-[#233554] shadow-2xl w-full max-w-md relative overflow-hidden group hover:border-[#64FFDA]/50 transition-colors duration-500">
        <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#64FFDA] to-transparent opacity-50 animate-scan-sweep" />
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2 bg-[#64FFDA]/10 rounded-lg group-hover:bg-[#64FFDA]/20 transition-colors">
            <ShieldCheck className="w-6 h-6 text-[#64FFDA] group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold group-hover:text-[#64FFDA] transition-colors">Sanctions Scan</h4>
            <p className="text-xs text-slate-400">Real-time database check</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { text: "Entity Validation", delay: 0.2 },
            { text: "No Sanctions Found", delay: 0.4 },
            { text: "VIES VAT Active", delay: 0.6 }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: item.delay, duration: 0.5 }}
              className="flex items-center gap-3 p-3 bg-[#0A192F] rounded-lg border border-[#233554] group-hover:border-[#64FFDA]/30 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-[#64FFDA]" />
              <span className="text-xs text-slate-300">{item.text}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <span className="text-xs font-mono text-[#64FFDA] bg-[#64FFDA]/10 px-2 py-1 rounded border border-[#64FFDA]/20">0 THREATS FOUND</span>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    title: "The Digital Product Passport",
    description: "CBAM and Rules of Origin data sharing. Generate a secure digital passport for your goods to share with EU buyers.",
    visual: (
      <div className="bg-[#112240] p-6 rounded-xl border border-[#233554] shadow-2xl w-full max-w-md flex flex-col items-center text-center group hover:border-[#64FFDA]/50 transition-colors duration-500">
        <motion.div 
          className="w-24 h-24 bg-white p-2 rounded-lg mb-4 relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <QrCode className="w-full h-full text-[#0A192F]" />
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-[#64FFDA]/50 shadow-[0_0_10px_#64FFDA]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        <h4 className="text-white text-sm font-semibold mb-1 group-hover:text-[#64FFDA] transition-colors">Product Passport</h4>
        <p className="text-xs text-slate-400 mb-4 font-mono">ID: 884-293-XJ</p>
        <div className="w-full grid grid-cols-2 gap-2">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="bg-[#0A192F] p-2 rounded border border-[#233554] group-hover:border-[#64FFDA]/30 transition-colors"
           >
             <span className="block text-[10px] text-slate-500">Origin</span>
             <span className="text-xs text-white">United Kingdom</span>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
             className="bg-[#0A192F] p-2 rounded border border-[#233554] group-hover:border-[#64FFDA]/30 transition-colors"
           >
             <span className="block text-[10px] text-slate-500">CO2</span>
             <span className="text-xs text-[#64FFDA]">0.45kg</span>
           </motion.div>
        </div>
      </div>
    )
  }
];

export const FeatureGrid = () => (
  <section className="py-20 lg:py-32 bg-[#0A192F] relative overflow-hidden">
    {/* Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#64FFDA] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
          The Intelligence Layer <br />
          <span className="text-slate-400">Above Your Logistics.</span>
        </h2>
      </div>

      <div className="space-y-24 lg:space-y-32">
        {solutions.map((solution, i) => (
          <motion.div 
            key={solution.title}
            className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Text Side */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              {solution.eyebrow && (
                <div className="text-[#64FFDA] font-mono text-sm tracking-widest mb-2">
                  {solution.eyebrow}
                </div>
              )}
              <h3 className="text-2xl md:text-4xl font-bold text-white">{solution.title}</h3>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {solution.description}
              </p>
              {solution.tags && (
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-2">
                  {solution.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#112240] border border-[#233554] rounded-full text-xs text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="pt-4 flex justify-center lg:justify-start">
                 <button className="text-[#64FFDA] font-semibold flex items-center gap-2 hover:gap-3 transition-all group">
                   Learn more <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* Visual Side */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <div className={`relative w-full max-w-md ${i % 2 === 1 ? 'lg:mr-auto lg:ml-0' : 'lg:ml-auto'}`}>
                <div className="absolute inset-0 bg-[#64FFDA] blur-[60px] opacity-10 rounded-full" />
                <div className="relative">
                  {solution.visual}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
