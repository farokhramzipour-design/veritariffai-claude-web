// src/app/(auth)/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token'); // Get token from URL query parameter

    if (token) {
      document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}`;

      // Redirect to the dashboard
      router.push('/dashboard');
    } else {
      // If no token is found in the URL, redirect to login with an error
      console.error('Authentication failed: No token found in callback URL.');
      router.push('/login?error=authentication_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F] text-white">
      <h1 className="text-2xl">Processing authentication...</h1>
    </div>
  );
}
