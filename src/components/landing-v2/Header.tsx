"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import { ThemeToggler } from '@/components/ThemeToggler';
import { Menu, X } from 'lucide-react';

const MobileMenu = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    className="fixed inset-0 z-40 bg-bg-canvas flex flex-col items-center justify-center"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <nav className="flex flex-col items-center gap-8">
      <a href="#" onClick={onClose} className="text-xl text-text-primary">Features</a>
      <a href="#" onClick={onClose} className="text-xl text-text-primary">Pricing</a>
      <a href="#" onClick={onClose} className="text-xl text-text-primary">API</a>
      <a href="/login" onClick={onClose} className="text-xl text-text-primary">Sign In</a>
    </nav>
  </motion.div>
);

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
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
            <button className="hidden sm:inline-block px-4 py-1.5 text-sm font-semibold rounded-md bg-brand-primary text-white hover:bg-brand-hover transition-colors">
              Start Free
            </button>
            <button className="md:hidden p-2 text-text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>
      <AnimatePresence>
        {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
