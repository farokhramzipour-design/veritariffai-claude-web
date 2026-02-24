"use client";
import { motion } from 'framer-motion';

export const FinalCta = () => (
    <section className="py-20 lg:py-32 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
        >
            <h2 className="text-4xl font-bold text-text-primary tracking-tight">Stop Guessing Your Trade Costs.</h2>
            <button className="mt-8 relative group px-8 py-3 font-semibold rounded-md bg-brand-primary text-white hover:bg-brand-hover transition-opacity">
                <span className="absolute inset-0 rounded-md bg-brand-primary blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-glow" />
                <span className="relative">Start Free Calculation</span>
            </button>
        </motion.div>
    </section>
);
