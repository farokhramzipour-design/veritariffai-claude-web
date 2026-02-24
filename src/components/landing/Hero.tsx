"use client";
import { Search } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center pt-20 pb-32">
      {/* Background visual elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-mesh-gradient opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight tracking-tight">
          The End of Import
          <span className="text-brand-primary"> Cost Surprises.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
          Go from HS Code to true landed cost in seconds. Powered by live customs data, so you can stop guessing and start knowing.
        </p>
        
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Enter an HS Code, product, or URL to start"
              className="w-full h-14 pl-12 pr-4 rounded-full bg-bg-surface border-2 border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50 transition-all duration-300 shadow-lg"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-full bg-brand-primary text-bg-base font-semibold hover:bg-brand-secondary transition-colors">
              Calculate
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-text-secondary">
          Trusted by 2,400+ importers and customs brokers
        </div>
      </div>
    </section>
  );
}
