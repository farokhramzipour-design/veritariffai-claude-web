"use client";
import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/landing-v2/Header';
import { Footer } from '@/components/landing-v2/Footer';

const PricingPage = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // IntersectionObserver logic for .reveal elements
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observerRef.current?.unobserve(entry.target);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for small businesses and individuals.',
      features: ['5 Lookups/Month', 'Basic Duty Calculation', 'Email Support']
    },
    {
      name: 'Pro',
      price: '$99',
      description: 'For growing companies with higher volume.',
      features: ['500 Lookups/Month', 'Advanced HS Classification', 'Priority Support', 'Export Compliance']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Tailored solutions for large organizations.',
      features: ['Unlimited Lookups', 'API Access', 'Dedicated Account Manager', 'Custom Integration']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col">
       <Header isAuthenticated={false} />

      <main className="flex-grow">
        <section className="relative overflow-hidden py-[110px] px-[5%] border-t border-[rgba(100,255,218,0.12)] bg-[#0A192F]">
            {/* Animated drifting grid background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
            
            {/* Subtle radial teal glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(100,255,218,0.05)_0%,transparent_70%)] pointer-events-none"></div>

            <div className="container mx-auto max-w-[1200px] relative z-10">
                {/* Section Heading */}
                <div className="text-center mb-16">
                    <div className="reveal d1 inline-block font-mono text-[#64FFDA] text-sm tracking-[0.2em] uppercase mb-4">
                        {'// PLANS'}
                    </div>
                    <h2 className="reveal d2 text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Pricing Options
                    </h2>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
                    {plans.map((plan, index) => (
                        <div 
                            key={index}
                            className={`reveal d${index + 1} group relative bg-[rgba(255,255,255,0.025)] backdrop-blur-[20px] border border-[rgba(100,255,218,0.12)] rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(100,255,218,0.4)] hover:shadow-[0_20px_60px_rgba(100,255,218,0.08),0_0_0_1px_rgba(100,255,218,0.15)] overflow-hidden flex flex-col`}
                        >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(100,255,218,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            
                            <h3 className="text-2xl font-bold text-[#E6F1FF] mb-2 relative z-10">{plan.name}</h3>
                            <div className="text-4xl font-mono text-[#64FFDA] mb-4 relative z-10">{plan.price}<span className="text-sm text-[#A8B2D8]">/mo</span></div>
                            <p className="text-[#A8B2D8] text-sm mb-6 relative z-10">{plan.description}</p>
                            
                            <ul className="text-left space-y-3 mb-8 flex-grow relative z-10">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="text-[#E6F1FF] text-sm flex items-start gap-2">
                                        <span className="text-[#64FFDA]">✓</span> {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-3 rounded-lg border border-[#64FFDA] text-[#64FFDA] font-mono text-sm hover:bg-[#64FFDA] hover:text-[#0A192F] transition-all duration-300 relative z-10">
                                Choose Plan
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>
      <Footer />
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .d1 { transition-delay: 0.1s; }
        .d2 { transition-delay: 0.2s; }
        .d3 { transition-delay: 0.3s; }
        .d4 { transition-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default PricingPage;
