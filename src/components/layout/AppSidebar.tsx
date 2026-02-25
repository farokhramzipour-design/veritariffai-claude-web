import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calculator, 
  History, 
  Settings, 
  LogOut, 
  User 
} from "lucide-react";

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 flex flex-col h-screen border-r border-[var(--border)] bg-[var(--s1)] text-[var(--text)]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[var(--cyan)] rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-black text-lg">V</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">VeriTariff</span>
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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--s3)] flex items-center justify-center border border-[var(--border)]">
            <User size={20} className="text-[var(--muted2)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">Jane Cooper</p>
            <p className="text-xs text-[var(--muted2)] truncate">jane@example.com</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link 
            href="/settings"
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-[var(--border)] rounded hover:bg-[var(--s2)] transition-colors text-xs font-medium text-[var(--muted2)] hover:text-[var(--text)]"
          >
            <Settings size={14} />
            Settings
          </Link>
          <button className="flex items-center justify-center p-2 border border-[var(--border)] rounded hover:bg-[var(--s2)] transition-colors text-[var(--muted2)] hover:text-[var(--red)]">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
