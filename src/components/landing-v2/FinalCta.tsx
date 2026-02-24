"use client";
import { motion } from 'framer-motion';

export const FinalCta = () => (
    <section className="py-20 lg:py-32 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
        >
            <h2 className="text-4xl font-bold text-white tracking-tight">Stop Guessing Your Trade Costs.</h2>
            <button className="mt-8 relative group px-8 py-3 font-semibold rounded-md bg-brand-blue text-white hover:opacity-90 transition-opacity">
                <span className="absolute inset-0 rounded-md bg-brand-blue blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-glow" />
                <span className="relative">Start Free Calculation</span>
            </button>
        </motion.div>
    </section>
);
