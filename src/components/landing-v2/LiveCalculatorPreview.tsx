"use client";
import { motion } from 'framer-motion';
import { PieChart, ResponsiveContainer, Cell, Pie } from 'recharts';

const data = [
  { name: 'Goods Value', value: 8470 },
  { name: 'Duty', value: 1420 },
  { name: 'Import VAT', value: 2168 },
  { name: 'Logistics', value: 780 },
];

const COLORS = ['#3A78FF', '#6C55F8', '#00C896', '#FFD166'];

export const LiveCalculatorPreview = () => (
  <section className="py-20 lg:py-32">
    <div className="container mx-auto px-4">
      <motion.div 
        className="bg-navy-light/50 rounded-2xl border border-glass-border p-8 lg:p-12 grid lg:grid-cols-2 gap-12 backdrop-blur-md items-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Live Calculation Preview</h3>
          {['Origin', 'Destination', 'HS Code', 'Incoterm', 'Value'].map((step, i) => (
            <div key={step} className={`p-4 rounded-lg border transition-colors ${i === 2 ? 'bg-brand-blue/20 border-brand-blue' : 'bg-navy-light border-navy-lighter'}`}>
              <p className={`font-medium ${i === 2 ? 'text-white' : 'text-slate-300'}`}>{i+1}. {step}</p>
            </div>
          ))}
        </div>
        <div className="bg-navy-light p-6 rounded-lg h-full flex flex-col">
          <h4 className="text-white font-semibold">Result Breakdown</h4>
          <p className="text-4xl font-bold text-white mt-4">€12,842.00</p>
          <p className="text-sm text-slate-400">Total Landed Cost</p>
          <div className="flex-grow w-full h-48 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-400">{entry.name}</span>
                <span className="ml-auto font-mono text-white">€{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
