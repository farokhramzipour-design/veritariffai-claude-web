import Logo from '@/components/ui/Logo';
import { Linkedin, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'API', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  Company: [
    { name: 'About Us', href: '#' },
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
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ],
};

export const Footer = () => (
  <footer className="py-16 border-t border-border-default bg-bg-surface/20">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-text-secondary">
            Landed cost intelligence for global trade.
          </p>
          <div className="mt-6 flex space-x-4">
            <a href="#" className="text-text-tertiary hover:text-text-primary"><Linkedin size={18} /></a>
            <a href="#" className="text-text-tertiary hover:text-text-primary"><Twitter size={18} /></a>
            <a href="#" className="text-text-tertiary hover:text-text-primary"><Youtube size={18} /></a>
          </div>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <ul className="mt-4 space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-border-default text-center text-sm text-text-tertiary">
        <p>© {new Date().getFullYear()} TradeCalc Technologies Inc. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
