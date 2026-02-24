"use client";
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Reduced landed cost forecasting errors by 80% in the first quarter. TradeCalc is our single source of truth for customs valuation.",
    name: "Sarah Johnson",
    title: "Head of Logistics, European Imports Co.",
  },
  {
    quote: "The API integration was seamless. We now have real-time, accurate landed cost data flowing directly into our ERP system.",
    name: "David Chen",
    title: "CTO, Global Freight Forwarders",
  },
  {
    quote: "Identifying an anti-dumping duty on a new product line before we even placed the order saved us a six-figure sum. Invaluable.",
    name: "Maria Rodriguez",
    title: "Procurement Director, Retail Goods Inc.",
  },
];

export const Testimonials = () => (
  <section className="py-20 lg:py-32 bg-navy-light/30">
    <div className="container mx-auto px-4">
      <h2 className="text-center text-4xl font-bold text-white tracking-tight">Trusted by the Professionals Shaping Global Trade</h2>
      <div className="mt-16 grid lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, i) => (
          <motion.div
            key={testimonial.name}
            className="p-8 rounded-xl border border-glass-border bg-navy-light/50"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="text-slate-300">"{testimonial.quote}"</p>
            <div className="mt-6">
              <p className="font-semibold text-white">{testimonial.name}</p>
              <p className="text-sm text-slate-400">{testimonial.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
