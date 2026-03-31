"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

export function AuthInitializer() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, isLoading]);

  return null;
}
