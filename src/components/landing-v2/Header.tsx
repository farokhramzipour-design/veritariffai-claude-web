"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import { ThemeToggler } from '@/components/ThemeToggler';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

const MobileMenu = ({ onClose, isAuthenticated }: { onClose: () => void, isAuthenticated: boolean }) => (
  <motion.div
    className="fixed inset-0 z-40 bg-bg-canvas flex flex-col items-center justify-center"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <nav className="flex flex-col items-center gap-8">
      <Link href="#" onClick={onClose} className="text-xl text-text-primary">Features</Link>
      <Link href="#" onClick={onClose} className="text-xl text-text-primary">Pricing</Link>
      {isAuthenticated ? (
        <Link href="/dashboard" onClick={onClose} className="text-xl text-text-primary">Dashboard</Link>
      ) : (
        <Link href="/login" onClick={onClose} className="text-xl text-text-primary">Sign In</Link>
      )}
    </nav>
  </motion.div>
);

export const Header = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
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
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggler />
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-4 py-1.5 text-sm font-semibold rounded-md bg-brand-primary text-white hover:bg-brand-hover transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
                <Link href="/login" className="hidden sm:inline-block px-4 py-1.5 text-sm font-semibold rounded-md bg-brand-primary text-white hover:bg-brand-hover transition-colors">
                  Start Free
                </Link>
              </>
            )}
            <button className="md:hidden p-2 text-text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>
      <AnimatePresence>
        {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} isAuthenticated={isAuthenticated} />}
      </AnimatePresence>
    </>
  );
};
