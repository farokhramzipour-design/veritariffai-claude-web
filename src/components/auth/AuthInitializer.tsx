"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

export function AuthInitializer() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}
