import React from 'react';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  roles: string[];
  linkedin: string;
  image?: string;
  delay?: string; // For staggered reveal animation
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ name, roles, linkedin, image, delay }) => (
  <div className={`team-card relative group p-10 text-center rounded-2xl border transition-all duration-300 ${delay} reveal`}>
    {/* Card ::before for gradient overlay */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none team-card-overlay"></div>

    {/* Avatar with rotating dashed ring and glowing border */}
    <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center avatar-container">
      <div className="absolute inset-0 rounded-full border border-dashed border-[rgba(100,255,218,0.25)] animate-spin-slow"></div>
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-teal-glow transition-all duration-300 group-hover:border-teal-glow-hover">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-white">
            {name.charAt(0)}
          </div>
        )}
      </div>
    </div>

    <h2 className="team-name font-syne font-extrabold text-xl text-white-light mt-5 mb-2 tracking-tight reveal">
      {name}
    </h2>
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {roles.map((role, index) => (
        <span key={index} className="role-pill font-jetbrains-mono text-xs text-teal-accent px-3 py-1 rounded-full border border-teal-border bg-teal-bg reveal">
          {role}
        </span>
      ))}
    </div>
    <Link
      href={linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="linkedin-button inline-flex items-center gap-2 px-5 py-2 rounded-md border text-teal-accent font-jetbrains-mono text-sm transition-all duration-300 reveal"
    >
      <Linkedin size={16} /> LinkedIn
    </Link>

    {/* Card ::after for bottom border sweep */}
    <div className="absolute bottom-0 left-0 w-full h-[2px] team-card-bottom-sweep"></div>
  </div>
);

const TeamPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Hasti Ebrahimighosour',
      roles: ['Business Development', 'Founder'],
      linkedin: 'https://www.linkedin.com/in/hasti-ebrahimighosour5/',
      image: '/images/hasti.jpg',
      delay: 'd1',
    },
    {
      name: 'Behnam Ahmadifar',
      roles: ['CTO', 'Founder'],
      linkedin: 'https://www.linkedin.com/in/behnam-ahmadifar-63799424/',
      image: '/images/behnam.jpg',
      delay: 'd2',
    },
  ];

  return (
    <section className="team-section relative overflow-hidden bg-navy-dark pt-[110px] pb-[110px] px-[5%] border-t border-teal-border-light">
      {/* Animated grid background */}
      <div className="grid-bg absolute inset-0 pointer-events-none"></div>
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-teal-glow-radial blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <p className="font-jetbrains-mono text-teal-accent uppercase text-sm tracking-widest mb-3 reveal">
            // THE FOUNDERS
          </p>
          <h1 className="font-syne font-extrabold text-5xl md:text-6xl text-white-light reveal">
            Meet Our Team
          </h1>
        </div>

        {/* Team Cards */}
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} {...member} />
          ))}
        </div>

        {/* Footer Tagline */}
        <div className="text-center mt-24 reveal d4">
          <div className="w-16 h-px bg-teal-accent opacity-40 mx-auto mb-6"></div>
          <p className="max-w-xl mx-auto text-lg text-slate-light leading-relaxed">
            We are a passionate team dedicated to <em className="text-teal-accent font-semibold">revolutionizing</em> trade compliance with cutting-edge technology.
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        /* CSS Variables (assuming these are not globally defined) */
        :root {
          --navy-dark: #0A192F;
          --teal-accent: #64FFDA;
          --teal-border-light: rgba(100, 255, 218, 0.12);
          --teal-border-medium: rgba(100, 255, 218, 0.4);
          --teal-bg-light: rgba(100, 255, 218, 0.08);
          --white-light: #E6F1FF;
          --slate-light: #A8B2D8;
        }

        /* Fonts (assuming Syne and JetBrains Mono are imported globally) */
        /* If not, you'd need to import them, e.g., via @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Syne:wght@800&display=swap'); */
        .font-syne {
          font-family: 'Syne', sans-serif;
        }
        .font-jetbrains-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Keyframes (assuming these are not globally defined) */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.4); }
          50% { box-shadow: 0 0 30px rgba(100, 255, 218, 0.6); }
          100% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.4); }
        }

        /* Reveal animations (assuming .reveal, .d1, .d2, .d4 are handled by a global IntersectionObserver) */
        /* If not, you'd need to define them here or in globals.css */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .d1 { transition-delay: 0.1s; }
        .d2 { transition-delay: 0.3s; }
        .d4 { transition-delay: 0.4s; } /* Adjusted for tagline */


        /* Team Card Specific Styles */
        .team-card {
          background: rgba(255, 255, 255, 0.025);
          backdrop-filter: blur(20px);
          border-color: var(--teal-border-light);
          flex: 1 1 380px; /* Ensure equal width and responsiveness */
          max-width: 450px; /* Max width for individual card */
          position: relative;
          overflow: hidden; /* For pseudo-elements */
        }

        .team-card:hover {
          transform: translateY(-8px);
          border-color: var(--teal-border-medium);
          box-shadow: 0 20px 60px rgba(100, 255, 218, 0.08), 0 0 0 1px rgba(100, 255, 218, 0.15);
        }

        /* Card Overlay (::before equivalent) */
        .team-card-overlay {
          background: linear-gradient(180deg, rgba(100, 255, 218, 0.05) 0%, rgba(100, 255, 218, 0) 100%);
        }

        /* Card Bottom Sweep (::after equivalent) */
        .team-card-bottom-sweep {
          background: linear-gradient(90deg, rgba(100, 255, 218, 0) 0%, var(--teal-accent) 50%, rgba(100, 255, 218, 0) 100%);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.4s ease-out;
        }
        .team-card:hover .team-card-bottom-sweep {
          transform: scaleX(1);
        }

        /* Avatar Glowing Ring */
        .border-teal-glow {
          border-color: var(--teal-accent);
          box-shadow: 0 0 20px rgba(100, 255, 218, 0.4);
          animation: pulse-glow 3s infinite ease-in-out; /* Subtle pulse */
        }
        .group-hover .border-teal-glow-hover {
          box-shadow: 0 0 30px rgba(100, 255, 218, 0.6), 0 0 40px rgba(100, 255, 218, 0.8); /* Intensify on hover */
          animation: none; /* Stop pulse on hover for stronger glow */
        }

        /* Role Pill */
        .role-pill {
          background-color: var(--teal-bg-light);
          border-color: rgba(100, 255, 218, 0.2);
        }

        /* LinkedIn Button */
        .linkedin-button {
          border-color: rgba(100, 255, 218, 0.25);
          color: var(--teal-accent);
          margin-top: 24px;
        }
        .linkedin-button:hover {
          background-color: rgba(100, 255, 218, 0.1);
          border-color: var(--teal-accent);
          box-shadow: 0 0 15px rgba(100, 255, 218, 0.3);
        }

        /* Global grid-bg (assuming it's defined elsewhere, if not, add its styles here) */
        .grid-bg {
          /* Example styles if not defined globally */
          background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </section>
  );
};

export default TeamPage;
