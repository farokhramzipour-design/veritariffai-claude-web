import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  History,
  Ship,
  BookMarked,
} from "lucide-react";
import UserProfile from "@/components/auth/UserProfile";

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 flex flex-col h-screen border-r border-[var(--border)] bg-[var(--s1)] text-[var(--text)]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--cyan)] rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-black text-lg">V</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">VeriTariff</span>
          </div>
          {/* User Profile Circle Button */}
          <div className="flex-shrink-0">
             <UserProfile />
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link 
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              isActive('/dashboard') 
                ? 'bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border border-[rgba(0,229,255,0.2)]' 
                : 'text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--s2)]'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-display text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link 
            href="/calculator"
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              isActive('/calculator') 
                ? 'bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border border-[rgba(0,229,255,0.2)]' 
                : 'text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--s2)]'
            }`}
          >
            <Calculator size={20} />
            <span className="font-display text-sm font-medium">New Calculation</span>
          </Link>
          
          <Link
            href="/shipment/new"
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              pathname?.startsWith('/shipment')
                ? 'bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border border-[rgba(0,229,255,0.2)]'
                : 'text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--s2)]'
            }`}
          >
            <Ship size={20} />
            <span className="font-display text-sm font-medium">Steel Export</span>
          </Link>


          <Link
            href="/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              isActive('/history')
                ? 'bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border border-[rgba(0,229,255,0.2)]'
                : 'text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--s2)]'
            }`}
          >
            <History size={20} />
            <span className="font-display text-sm font-medium">History</span>
          </Link>

          <Link
            href="/profiles"
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              isActive('/profiles')
                ? 'bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border border-[rgba(0,229,255,0.2)]'
                : 'text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--s2)]'
            }`}
          >
            <BookMarked size={20} />
            <span className="font-display text-sm font-medium">Saved Profiles</span>
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[var(--border)]">
        <div className="bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] rounded-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[var(--cyan)] uppercase tracking-wider">Pro Plan</span>
            <span className="text-[10px] text-[var(--muted2)]">RENEWS IN 12 DAYS</span>
          </div>
          <div className="w-full h-1 bg-[var(--s3)] rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-[var(--cyan)] rounded-full"></div>
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-2">47 / 100 calculations used</p>
        </div>
      </div>
    </aside>

  );
}
