"use client";
import Logo from '@/components/ui/Logo';
import Link from 'next/link';

export const Header = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-canvas/80 backdrop-blur-lg border-b border-border-default">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};
