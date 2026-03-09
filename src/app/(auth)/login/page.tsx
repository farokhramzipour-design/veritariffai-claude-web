"use client";

import AuthFlow from "@/components/auth/AuthFlow";

const LeftPanel = () => (
  <div className="w-full lg:w-1/2 bg-bg-surface p-12 flex flex-col justify-center items-center text-center">
    <h1 className="text-4xl font-bold font-display mb-4">
      Customs calculations that professionals trust.
    </h1>
    <ul className="text-text-secondary space-y-2">
      <li>• Live TARIC + UKGT data</li>
      <li>• 11 calculation engines</li>
      <li>• Full audit trail</li>
    </ul>
  </div>
);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <LeftPanel />
      <div className="w-full lg:w-1/2 p-12 flex items-center justify-center">
        <AuthFlow />
      </div>
    </div>
  );
}
