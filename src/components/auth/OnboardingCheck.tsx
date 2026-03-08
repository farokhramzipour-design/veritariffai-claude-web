"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import OnboardingModal from "./OnboardingModal";
import { useEffect, useState } from "react";

export function OnboardingCheck() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check auth on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.role) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isLoading, isAuthenticated, user]);

  if (!showModal) return null;

  return <OnboardingModal onClose={() => setShowModal(false)} />;
}
