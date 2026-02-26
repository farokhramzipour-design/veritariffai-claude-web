"use client";
import { motion } from 'framer-motion';
import { Shield, Award, Check } from 'lucide-react';

export const Testimonials = () => (
  <section className="py-20 lg:py-32 bg-[#0A192F] relative overflow-hidden">
    <div className="absolute inset-0 bg-[#112240]/50" />
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Text Side */}
        <motion.div 
          className="max-w-xl text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 text-[#64FFDA] text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            <span>Trusted Certification</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Democratizing the <br />
            <span className="text-[#64FFDA]">VIP Green Lane.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Stop paying £50k for consultants. Our OS automatically builds the digital audit trail required for Authorised Economic Operator (AEO) status.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Faster Customs Clearance",
              "Lower Inspection Rates",
              "Duty Deferment Waivers"
            ].map((text, i) => (
              <motion.div 
                key={text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-center gap-3"
              >
                <div className="p-1 rounded-full bg-[#64FFDA]/10">
                  <Check className="w-4 h-4 text-[#64FFDA]" />
                </div>
                <span className="text-slate-300">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Visual Badge Side */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={{ y: [0, -15, 0] }}
          transition={{ 
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" } 
          }}
        >
          {/* Glowing Background */}
          <div className="absolute inset-0 bg-[#64FFDA] blur-[80px] opacity-20 rounded-full animate-pulse" />
          
          {/* Badge */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#1d3356] to-[#0A192F] rounded-full border-4 border-[#64FFDA]/30 flex items-center justify-center shadow-2xl overflow-hidden group hover:border-[#64FFDA]/60 transition-colors duration-500">
            <div className="absolute inset-2 rounded-full border border-[#64FFDA]/10 border-dashed animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#64FFDA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="text-center relative z-10">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield className="w-20 h-20 text-[#64FFDA] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(100,255,218,0.3)]" />
              </motion.div>
              <div className="text-2xl font-bold text-white tracking-widest">AEO</div>
              <div className="text-sm text-[#64FFDA] tracking-widest uppercase mt-1">Certified</div>
              <div className="mt-4 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.div 
                    key={s} 
                    className="w-1 h-1 bg-[#64FFDA] rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: s * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  </section>
);
