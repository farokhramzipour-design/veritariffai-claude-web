"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { Header } from '@/components/landing-v2/Header';
import { Footer } from '@/components/landing-v2/Footer';
import { GlobalEffects } from '@/components/landing-v2/GlobalEffects';

const TEAM = [
  {
    name: 'Hasti Ebrahimighosour',
    roles: ['Business Development', 'Founder'],
    linkedin: 'https://www.linkedin.com/in/hasti-ebrahimighosour5/',
    image: '/images/hasti.jpg',
    delay: 0.1,
  },
  {
    name: 'Behnam Ahmadifar',
    roles: ['CTO', 'Founder'],
    linkedin: 'https://www.linkedin.com/in/behnam-ahmadifar-63799424/',
    image: '/images/behnam.jpg',
    delay: 0.2,
  },
];

function TeamCard({ name, roles, linkedin, image, delay }: typeof TEAM[0]) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative flex-1 max-w-[450px] p-10 text-center rounded-2xl border border-[rgba(100,255,218,0.12)] bg-[rgba(255,255,255,0.025)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(100,255,218,0.4)] hover:shadow-[0_20px_60px_rgba(100,255,218,0.08),0_0_0_1px_rgba(100,255,218,0.15)] overflow-hidden"
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[rgba(100,255,218,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {/* Bottom sweep */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#64FFDA] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-center" />

      {/* Avatar */}
      <div className="relative w-28 h-28 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border border-dashed border-[rgba(100,255,218,0.25)] animate-spin-slow" />
        <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#64FFDA] shadow-[0_0_20px_rgba(100,255,218,0.4)]">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            onError={() => {}}
          />
        </div>
      </div>

      <h2 className="font-bold text-xl text-white mt-5 mb-2 tracking-tight relative z-10">{name}</h2>

      <div className="flex flex-wrap justify-center gap-2 mb-6 relative z-10">
        {roles.map((role) => (
          <span
            key={role}
            className="font-mono text-xs text-[#64FFDA] px-3 py-1 rounded-full border border-[rgba(100,255,218,0.2)] bg-[rgba(100,255,218,0.08)]"
          >
            {role}
          </span>
        ))}
      </div>

      <Link
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-[rgba(100,255,218,0.25)] text-[#64FFDA] font-mono text-sm transition-all duration-300 hover:bg-[rgba(100,255,218,0.1)] hover:border-[#64FFDA] hover:shadow-[0_0_15px_rgba(100,255,218,0.3)] relative z-10"
      >
        <Linkedin size={16} /> LinkedIn
      </Link>
    </motion.div>
  );
}

export default function TeamPage() {
  return (
    <div className="relative overflow-x-hidden min-h-screen bg-[#0A192F]">
      <GlobalEffects />
      <Header isAuthenticated={false} />

      <main className="relative z-10 pt-24">
        <section className="relative overflow-hidden py-24 px-[5%] border-t border-[rgba(100,255,218,0.12)]">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(100,255,218,0.06)_0%,transparent_70%)] blur-[150px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <p className="font-mono text-[#64FFDA] uppercase text-sm tracking-widest mb-3">
                {'// THE FOUNDERS'}
              </p>
              <h1 className="font-bold text-5xl md:text-6xl text-white">
                Meet Our Team
              </h1>
            </motion.div>

            {/* Cards */}
            <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
              {TEAM.map((member) => (
                <TeamCard key={member.name} {...member} />
              ))}
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-24"
            >
              <div className="w-16 h-px bg-[#64FFDA] opacity-40 mx-auto mb-6" />
              <p className="max-w-xl mx-auto text-lg text-[#A8B2D8] leading-relaxed">
                We are a passionate team dedicated to{' '}
                <em className="text-[#64FFDA] font-semibold">revolutionizing</em>{' '}
                trade compliance with cutting-edge technology.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
