"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { Header } from '@/components/landing-v2/Header';
import { Footer } from '@/components/landing-v2/Footer';

const TeamPage = () => {
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

  const teamMembers = [
    {
      name: 'Hasti Ebrahimighosour',
      roles: ['Business Development', 'Founder'],
      linkedin: 'https://www.linkedin.com/in/hasti-ebrahimighosour5/',
      image: '/images/hasti.jpg',
    },
    {
      name: 'Behnam Ahmadifar',
      roles: ['CTO', 'Founder'],
      linkedin: 'https://www.linkedin.com/in/behnam-ahmadifar-63799424/',
      image: '/images/behnam.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col">
       {/* Assuming the user wants Header and Footer on this page too, though not explicitly asked, it makes sense for a page */}
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
                        // THE FOUNDERS
                    </div>
                    <h2 className="reveal d2 text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Meet Our Team
                    </h2>
                </div>

                {/* Team Cards */}
                <div className="flex flex-col md:flex-row justify-center gap-8 max-w-[900px] mx-auto">
                    {teamMembers.map((member, index) => (
                        <div 
                            key={index}
                            className={`reveal d${index + 1} group relative flex-1 bg-[rgba(255,255,255,0.025)] backdrop-blur-[20px] border border-[rgba(100,255,218,0.12)] rounded-2xl p-10 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(100,255,218,0.4)] hover:shadow-[0_20px_60px_rgba(100,255,218,0.08),0_0_0_1px_rgba(100,255,218,0.15)] overflow-hidden`}
                        >
                            {/* Hover gradient overlay (::before equivalent) */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(100,255,218,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            
                            {/* Bottom border sweep (::after equivalent) */}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#64FFDA] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>

                            {/* Avatar */}
                            <div className="relative w-[100px] h-[100px] mx-auto mb-6">
                                {/* Rotating dashed ring */}
                                <div className="absolute inset-[-10px] border border-dashed border-[rgba(100,255,218,0.25)] rounded-full animate-spin-slow"></div>
                                {/* Image container with glow */}
                                <div className="relative w-full h-full rounded-full border-2 border-[#64FFDA] shadow-[0_0_20px_rgba(100,255,218,0.4)] group-hover:shadow-[0_0_30px_rgba(100,255,218,0.6)] transition-shadow duration-300 overflow-hidden">
                                     {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-white">
                                            {member.name.charAt(0)}
                                         </div>
                                     )}
                                </div>
                            </div>

                            {/* Name */}
                            <h3 className="text-2xl font-bold text-[#E6F1FF] mt-5 mb-2 tracking-tight">
                                {member.name}
                            </h3>

                            {/* Roles */}
                            <div className="flex flex-col items-center gap-2 mb-6">
                                {member.roles.map((role, rIndex) => (
                                    <span key={rIndex} className="font-mono text-[0.82rem] text-[#64FFDA] tracking-[0.08em] bg-[rgba(100,255,218,0.08)] border border-[rgba(100,255,218,0.2)] rounded-[20px] px-3 py-[3px]">
                                        {role}
                                    </span>
                                ))}
                            </div>

                            {/* LinkedIn Button */}
                            <Link 
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-2 px-5 py-2 rounded-md border border-[rgba(100,255,218,0.25)] text-[#64FFDA] font-mono text-[0.82rem] transition-all duration-300 hover:bg-[rgba(100,255,218,0.1)] hover:border-[#64FFDA] hover:shadow-[0_0_15px_rgba(100,255,218,0.2)]"
                            >
                                <Linkedin size={16} />
                                <span>LinkedIn</span>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Footer Tagline */}
                <div className="reveal d4 mt-10 text-center max-w-[600px] mx-auto">
                    <div className="w-[60px] h-[1px] bg-[#64FFDA] opacity-40 mx-auto mb-6"></div>
                    <p className="text-[#A8B2D8] text-base leading-relaxed">
                        We are a passionate team dedicated to <span className="text-[#64FFDA] italic">revolutionizing</span> trade compliance with cutting-edge technology.
                    </p>
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

export default TeamPage;
