"use client";
import { motion } from 'framer-motion';
import { AlertTriangle, FileWarning, Calculator, RefreshCw } from 'lucide-react';

const problems = [
  { text: "Hidden duties discovered at clearance", icon: FileWarning },
  { text: "Unexpected anti-dumping charges", icon: AlertTriangle },
  { text: "Manual spreadsheets with outdated rates", icon: Calculator },
  { text: "Inconsistent FX conversions", icon: RefreshCw },
];

export const ProblemSolution = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
      <div className="space-y-4">
        {problems.map((problem, i) => (
          <motion.div 
            key={problem.text}
            className="p-4 rounded-lg border border-border-default bg-bg-surface/50 flex items-center gap-4 shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="w-10 h-10 bg-bg-elevated rounded-md flex items-center justify-center flex-shrink-0">
              <problem.icon className="w-5 h-5 text-accent-warning" />
            </div>
            <p className="font-medium text-text-secondary text-sm sm:text-base">{problem.text}</p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="text-center lg:text-left"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          From Ambiguity to Accuracy.
        </h2>
        <p className="mt-6 text-base sm:text-lg text-text-secondary">
          TradeCalc integrates official tariff databases, applies real-time rules of origin logic, and exposes every component of your landed cost. Eliminate guesswork and build supply chain resilience.
        </p>
      </motion.div>
    </div>
  </section>
);
