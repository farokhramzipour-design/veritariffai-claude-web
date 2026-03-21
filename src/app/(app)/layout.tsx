import AppSidebar from "@/components/layout/AppSidebar";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AuthInitializer />
      <AppSidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
