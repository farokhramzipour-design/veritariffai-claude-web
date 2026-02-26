"use client";
import Logo from '@/components/ui/Logo';
import Link from 'next/link';

export const Header = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A192F]/90 backdrop-blur-lg border-b border-[#233554] transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
           <div className="transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(100,255,218,0.5)]">
             <Logo />
           </div>
           <span className="text-white font-bold text-xl tracking-tight hidden sm:inline-block group-hover:text-[#64FFDA] transition-colors duration-300">Veritariff</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Resources', 'Team'].map((item) => ( // Added 'Team' here
            <Link 
              key={item}
              href={`/${item.toLowerCase()}`} // Link to separate pages
              className="relative text-sm font-medium text-slate-300 hover:text-[#64FFDA] transition-colors py-1 group"
            >
              {item}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#64FFDA] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-bold rounded-lg bg-[#64FFDA] text-[#0A192F] hover:bg-[#4cdbb5] transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-slate-300 hover:text-white transition-colors hover:translate-x-1 duration-300">Sign In</Link>
              <Link href="/calculator" className="relative overflow-hidden px-5 py-2.5 text-sm font-bold rounded-lg bg-[#64FFDA] text-[#0A192F] transition-all duration-300 shadow-[0_0_15px_rgba(100,255,218,0.3)] hover:shadow-[0_0_25px_rgba(100,255,218,0.6)] hover:-translate-y-0.5 group">
                <span className="relative z-10">Start Free</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
