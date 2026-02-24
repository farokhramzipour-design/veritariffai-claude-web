export default function AppSidebar() {
  return (
    <aside className="w-60 flex flex-col p-4 border-r border-border-default bg-bg-surface">
      <div className="mb-4">Logo</div>
      <nav className="flex flex-col gap-2">
        <a>Dashboard</a>
        <a>New Calculation</a>
        <a>History</a>
      </nav>
      <div className="mt-auto">
        <div>Plan Badge</div>
        <div className="mt-4">
          <a>Settings</a>
          <div>User Avatar</div>
          <a>Sign Out</a>
        </div>
      </div>
    </aside>
  );
}
