"use client";
import { motion } from 'framer-motion';
import { ArrowDown, Flag, Shuffle } from 'lucide-react';

const problems = [
  { 
    title: "Profit Wiped Out",
    text: "A 5-day customs delay equals a 1% tariff increase.", 
    icon: ArrowDown 
  },
  { 
    title: "Compliance Fines",
    text: "Sanctions and carbon taxes are now board-level financial risks.", 
    icon: Flag 
  },
  { 
    title: "Manual Chaos",
    text: "Endless emails between forwarders, suppliers, and customs brokers.", 
    icon: Shuffle 
  },
];

export const ProblemSolution = () => (
  <section className="py-20 lg:py-32 bg-white">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
          80% of SMEs manage border risk with Excel. <br />
          <span className="text-red-600">They are flying blind.</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {problems.map((problem, i) => (
          <motion.div 
            key={problem.title}
            className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm text-red-600 group-hover:scale-110 group-hover:bg-red-50 transition-all duration-300">
              <problem.icon className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{problem.title}</h3>
            <p className="text-slate-600 leading-relaxed">{problem.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
