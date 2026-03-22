import type { ReactNode } from "react";
import { ShipmentProvider } from "./components/ShipmentContext";
import { TopBar } from "./components/TopBar";
import { StepNav } from "./components/StepNav";
import { WorkspacePanel } from "./components/WorkspacePanel";

export default function WorkflowLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { shipmentId: string };
}) {
  return (
    <ShipmentProvider shipmentId={params.shipmentId}>
      {/* Full-height override — cancel parent p-8 */}
      <div className="-m-8 flex flex-col bg-[#0D1F3C] text-[#F8F6F0]" style={{ height: "calc(100vh)" }}>
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <StepNav />
          <main className="flex-1 overflow-y-auto bg-[#0f1e35] px-8 py-6">
            {children}
          </main>
          <WorkspacePanel />
        </div>
      </div>
    </ShipmentProvider>
  );
}
