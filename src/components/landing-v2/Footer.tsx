"use client";
import Logo from '@/components/ui/Logo';
import { Linkedin, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link'; // Import Link component

const footerLinks = {
  Product: [
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'API', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  Company: [
    { name: 'About Us', href: '#' },
    { name: 'Team', href: '/team' }, // Added Team link
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' },
  ],
  Resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'Glossary', href: '#' },
    { name: 'System Status', href: '#' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/legal/privacy-policy' },
    { name: 'Terms and Conditions', href: '/legal/terms-and-conditions' },
    { name: 'Cookie Policy', href: '#' },
  ],
};

export const Footer = () => (
  <footer className="py-16 border-t border-[#233554] bg-[#0A192F]">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(100,255,218,0.5)]">
              <Logo />
            </div>
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-[#64FFDA] transition-colors duration-300">Veritariff</span>
          </div>
          <p className="mt-4 text-sm text-slate-400 max-w-xs">
            Global trade is a data minefield. Veritariff is the central hub to simulate profit margins, automate customs workflows, and instantly clear sanctions.
          </p>
          <div className="mt-6 flex space-x-4">
            <a href="#" className="text-slate-400 hover:text-[#64FFDA] transition-all duration-300 hover:scale-110 hover:-translate-y-1"><Linkedin size={20} /></a>
            <a href="#" className="text-slate-400 hover:text-[#64FFDA] transition-all duration-300 hover:scale-110 hover:-translate-y-1"><Twitter size={20} /></a>
            <a href="#" className="text-slate-400 hover:text-[#64FFDA] transition-all duration-300 hover:scale-110 hover:-translate-y-1"><Youtube size={20} /></a>
          </div>
        </div>
        
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className="col-span-1">
            <h3 className="font-bold text-white mb-4">{title}</h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') && link.href !== '#' ? ( // Use Link for internal paths
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-[#64FFDA] transition-all duration-200 block hover:translate-x-1">
                      {link.name}
                    </Link>
                  ) : ( // Use a for external or placeholder links
                    <a href={link.href} className="text-sm text-slate-400 hover:text-[#64FFDA] transition-all duration-200 block hover:translate-x-1">
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="pt-8 border-t border-[#233554] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Veritariff. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/legal/privacy-policy" className="hover:text-[#64FFDA] transition-colors">Privacy</Link>
          <Link href="/legal/terms-and-conditions" className="hover:text-[#64FFDA] transition-colors">Terms</Link>
          <a href="#" className="hover:text-[#64FFDA] transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);
