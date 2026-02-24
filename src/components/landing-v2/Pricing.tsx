"use client";
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: "Free",
    price: "£0",
    description: "For quick estimates and occasional use.",
    features: [
      "5 calculations per month",
      "Basic duty & VAT",
      "Community support",
    ],
    cta: "Start for Free",
    isFeatured: false,
  },
  {
    name: "Pro",
    price: "£49",
    priceSuffix: "/ month",
    description: "For serious importers and brokers.",
    features: [
      "Unlimited calculations",
      "Rules of Origin engine",
      "Anti-dumping detection",
      "PDF export & audit trail",
      "Priority support",
    ],
    cta: "Get Started with Pro",
    isFeatured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams requiring API access and custom integration.",
    features: [
      "Everything in Pro",
      "Full API access",
      "Dedicated account manager",
      "Custom integrations & SLA",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    isFeatured: false,
  },
];

export const Pricing = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4">
      <h2 className="text-center text-4xl font-bold text-white tracking-tight">Flexible pricing for teams of any size</h2>
      <p className="text-center mt-4 text-lg text-slate-400">Stop guessing your landed costs. Start calculating with confidence.</p>
      
      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            className={`relative p-8 rounded-2xl border ${tier.isFeatured ? 'border-brand-blue/50' : 'border-glass-border'} ${tier.isFeatured ? 'bg-navy-light' : 'bg-navy-light/40'}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            {tier.isFeatured && (
              <div className="absolute -top-px -left-px -right-px h-24 bg-gradient-to-b from-brand-blue/30 to-transparent rounded-t-2xl" />
            )}
            <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold text-white">{tier.price}</span>
              {tier.priceSuffix && <span className="text-slate-400">{tier.priceSuffix}</span>}
            </p>
            <p className="mt-2 text-sm text-slate-400">{tier.description}</p>
            <ul className="mt-8 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-brand-blue" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full mt-8 py-2.5 rounded-md font-semibold transition-opacity ${tier.isFeatured ? 'bg-brand-blue text-white hover:opacity-90' : 'bg-navy-lighter text-slate-300 hover:bg-opacity-80'}`}>
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
