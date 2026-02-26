"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FinalCta = () => (
    <section className="py-20 lg:py-32 text-center bg-[#0A192F] relative overflow-hidden">
        {/* Background Glow */}
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
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-8">
                Stop guessing your margins. <br />
                <span className="text-[#64FFDA]">Start controlling your trade.</span>
            </h2>
            
            <Link href="/calculator" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#0A192F] transition-all duration-300 bg-[#64FFDA] rounded-lg hover:bg-[#4cdbb5] hover:scale-105 hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#64FFDA] focus:ring-offset-[#0A192F] overflow-hidden">
              <span className="mr-2 relative z-10">Try calculator for free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 relative z-10" />
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
            </Link>

        </motion.div>
    </section>
);
