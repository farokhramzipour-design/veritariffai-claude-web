"use client";
import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/landing-v2/Header';
import { Footer } from '@/components/landing-v2/Footer';

const FeaturesPage = () => {
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

  const features = [
    {
      title: 'Automated HS Classification',
      description: 'AI-driven tool to accurately classify your goods with current tariff codes.',
      icon: '🔍'
    },
    {
      title: 'Duty Calculation Engine',
      description: 'Calculate total landed costs including duties, taxes, and fees instantly.',
      icon: '🧮'
    },
    {
      title: 'Real-time Sanctions Screening',
      description: 'Ensure compliance by screening against global sanctions lists automatically.',
      icon: '🛡️'
    },
    {
      title: 'Trade Agreement Optimization',
      description: 'Identify applicable free trade agreements to reduce duty spend.',
      icon: '🌐'
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
                        // CAPABILITIES
                    </div>
                    <h2 className="reveal d2 text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Platform Features
                    </h2>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className={`reveal d${(index % 4) + 1} group relative bg-[rgba(255,255,255,0.025)] backdrop-blur-[20px] border border-[rgba(100,255,218,0.12)] rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(100,255,218,0.4)] hover:shadow-[0_20px_60px_rgba(100,255,218,0.08),0_0_0_1px_rgba(100,255,218,0.15)] overflow-hidden`}
                        >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(100,255,218,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-[#E6F1FF] mb-3">{feature.title}</h3>
                                <p className="text-[#A8B2D8] text-sm leading-relaxed">{feature.description}</p>
                            </div>
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

export default FeaturesPage;
