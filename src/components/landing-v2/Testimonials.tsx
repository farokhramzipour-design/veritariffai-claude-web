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
  <section className="py-20 lg:py-32 bg-bg-surface/30">
    <div className="container mx-auto px-4">
      <h2 className="text-center text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Trusted by the Professionals Shaping Global Trade</h2>
      <div className="mt-12 sm:mt-16 grid lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, i) => (
          <motion.div
            key={testimonial.name}
            className="p-6 sm:p-8 rounded-xl border border-border-default bg-bg-surface/50"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="text-text-secondary text-base">"{testimonial.quote}"</p>
            <div className="mt-6">
              <p className="font-semibold text-text-primary">{testimonial.name}</p>
              <p className="text-sm text-text-secondary">{testimonial.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
