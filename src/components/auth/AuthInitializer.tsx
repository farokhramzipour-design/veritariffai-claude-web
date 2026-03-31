"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

export function AuthInitializer() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) checkAuth();
  }, [checkAuth, isAuthenticated]);

  return null;
}
