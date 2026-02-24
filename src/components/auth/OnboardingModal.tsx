"use client";

import { useAuthStore } from "@/lib/stores/authStore";

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-bg-elevated p-8 rounded-lg max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-4">👋 Welcome to TradeCalc</h2>
        <p className="text-text-secondary mb-4">
          You're signed in as {user?.email}
        </p>
        <div className="bg-bg-surface p-4 rounded-md text-left mb-8">
          <p className="font-bold">You're on the Free plan.</p>
          <ul className="text-sm text-text-secondary list-disc list-inside mt-2">
            <li>10 calculations per hour</li>
            <li>1 HS code per calculation</li>
            <li>Basic duty + VAT</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 p-3 bg-brand-primary text-bg-base font-bold rounded-md"
          >
            Run Your First Calculation →
          </button>
          <button 
            onClick={onClose}
            className="flex-1 p-3 bg-bg-input font-bold rounded-md"
          >
            See Pro Features
          </button>
        </div>
      </div>
    </div>
  );
}
