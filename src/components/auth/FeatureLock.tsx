import React from "react";

interface FeatureLockProps {
  title: string;
  teaser: string;
  children: React.ReactNode;
}

export default function FeatureLock({ title, teaser, children }: FeatureLockProps) {
  return (
    <div className="border border-border-default rounded-lg p-6 relative">
      <h3 className="font-bold text-lg mb-2">🔒 {title}</h3>
      <p className="text-text-secondary mb-4">{teaser}</p>
      <div className="relative">
        <div className="blur-sm select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-brand-accent text-bg-base font-bold py-2 px-4 rounded-md shadow-lg">
            ⚡ Unlock with Pro — See exact duty →
          </button>
        </div>
      </div>
    </div>
  );
}
