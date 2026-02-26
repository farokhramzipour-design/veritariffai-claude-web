"use client";
import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/landing-v2/Header';
import { Footer } from '@/components/landing-v2/Footer';
import Link from 'next/link';

const ResourcesPage = () => {
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

  const resources = [
    {
      title: 'Global Trade Compliance Guide 2024',
      type: 'Guide',
      description: 'Everything you need to know about the latest trade regulations.',
      link: '#'
    },
    {
      title: 'HS Code Classification Handbook',
      type: 'E-Book',
      description: 'Master the art of Harmonized System classification with our expert handbook.',
      link: '#'
    },
    {
      title: 'Navigating Sanctions in a Volatile World',
      type: 'Webinar',
      description: 'Watch our recorded webinar on strategies for staying compliant amidst changing sanctions.',
      link: '#'
    },
    {
      title: 'Import Duty Calculator Documentation',
      type: 'Documentation',
      description: 'Technical documentation for integrating our API into your systems.',
      link: '#'
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
                        // KNOWLEDGE BASE
                    </div>
                    <h2 className="reveal d2 text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Resources
                    </h2>
                </div>

                {/* Resources Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
                    {resources.map((resource, index) => (
                        <Link 
                            href={resource.link}
                            key={index}
                            className={`reveal d${(index % 4) + 1} group relative bg-[rgba(255,255,255,0.025)] backdrop-blur-[20px] border border-[rgba(100,255,218,0.12)] rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(100,255,218,0.4)] hover:shadow-[0_20px_60px_rgba(100,255,218,0.08),0_0_0_1px_rgba(100,255,218,0.15)] overflow-hidden block`}
                        >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(100,255,218,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 mb-4 text-xs font-mono text-[#64FFDA] border border-[#64FFDA] rounded-full bg-[#64FFDA]/10">
                                    {resource.type}
                                </span>
                                <h3 className="text-xl font-bold text-[#E6F1FF] mb-3 group-hover:text-[#64FFDA] transition-colors">{resource.title}</h3>
                                <p className="text-[#A8B2D8] text-sm leading-relaxed">{resource.description}</p>
                            </div>
                        </Link>
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

export default ResourcesPage;
