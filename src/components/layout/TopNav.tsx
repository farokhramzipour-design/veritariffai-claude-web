import Logo from "@/components/ui/Logo";

export default function TopNav() {
  return (
    <header className="flex justify-between items-center p-4 border-b border-border-default">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="text-xl font-bold tracking-tight text-text-primary">Veritariff</span>
      </div>
      <nav className="hidden md:flex gap-6 items-center">
        <a href="#" className="text-sm text-text-secondary hover:text-text-primary">Features</a>
        <a href="#" className="text-sm text-text-secondary hover:text-text-primary">Pricing</a>
        <a href="#" className="text-sm text-text-secondary hover:text-text-primary">Docs</a>
      </nav>
      <div className="flex gap-4 items-center">
        <a href="/login" className="text-sm text-text-secondary hover:text-text-primary">Login</a>
        <button className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-primary text-bg-base">
          Try Free →
        </button>
      </div>
    </header>
  );
}
