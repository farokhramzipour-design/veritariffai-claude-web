"use client";
import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import { ThemeToggler } from '@/components/ThemeToggler';

export const Header = () => {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-bg-canvas/80 backdrop-blur-lg border-b border-border-default"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
          <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
          <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">API</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggler />
          <a href="/login" className="hidden sm:inline-block px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">Sign In</a>
          <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-brand-primary text-white hover:bg-brand-hover transition-colors">
            Start Free
          </button>
        </div>
      </div>
    </motion.header>
  );
};
