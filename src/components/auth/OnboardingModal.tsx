"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import OnboardingFlow from "./OnboardingFlow";

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <OnboardingFlow onComplete={onClose} />
    </div>
  );
}
