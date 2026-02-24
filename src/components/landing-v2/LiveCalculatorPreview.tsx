"use client";
import { motion, useAnimate, stagger } from 'framer-motion';
import { PieChart, ResponsiveContainer, Cell, Pie } from 'recharts';
import { useEffect } from 'react';

const data = [
  { name: 'Goods Value', value: 8470, color: 'var(--color-data-goods)' },
  { name: 'Duty', value: 1420, color: 'var(--color-data-duty)' },
  { name: 'Import VAT', value: 2168, color: 'var(--color-data-vat)' },
  { name: 'Logistics', value: 780, color: 'var(--color-data-freight)' },
];

const steps = ['Origin', 'Destination', 'HS Code', 'Incoterm', 'Value'];

export const LiveCalculatorPreview = () => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const animateSequence = async () => {
      while (true) {
        // Reset
        await animate('.step-item', { backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-default)' }, { duration: 0 });
        await animate('.step-item p', { color: 'var(--color-text-secondary)' }, { duration: 0 });
        await animate('.result-value', { opacity: 0, y: -10 }, { duration: 0 });
        
        // Animate steps
        await animate('.step-item', { backgroundColor: ['var(--color-brand-primary-10)', 'var(--color-bg-surface)'] }, { delay: stagger(0.7), duration: 0.5 });
        
        // Animate result
        await animate('.result-value', { opacity: 1, y: 0 }, { duration: 0.5 });
        
        // Wait before restarting
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    };
    animateSequence();
  }, [animate]);

  return (
    <section className="py-20 lg:py-32" ref={scope}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-bg-surface/50 rounded-2xl border border-border-default p-6 md:p-8 lg:p-12 grid lg:grid-cols-2 gap-8 lg:gap-12 backdrop-blur-md items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-2xl font-bold text-text-primary text-center lg:text-left">Live Calculation Preview</h3>
            {steps.map((step, i) => (
              <div key={step} className="step-item p-4 rounded-lg border transition-colors bg-bg-surface border-border-default">
                <p className="font-medium text-text-secondary">{i+1}. {step}</p>
              </div>
            ))}
          </div>
          <div className="bg-bg-surface p-6 rounded-lg h-full flex flex-col">
            <h4 className="text-text-primary font-semibold">Result Breakdown</h4>
            <motion.p className="result-value text-4xl font-bold text-text-primary mt-2">€12,842.00</motion.p>
            <p className="text-sm text-text-secondary">Total Landed Cost</p>
            <div className="flex-grow w-full h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-text-secondary">{entry.name}</span>
                  <span className="ml-auto font-mono text-text-primary">€{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
