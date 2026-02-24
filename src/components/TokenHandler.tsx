"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export function TokenHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      // Clean the URL by removing the token query parameter
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router, setToken]);

  return null; // This component renders nothing
}
