import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Read token from cookie directly (used as fallback before store hydrates)
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Request interceptor to inject the auth token
apiClient.interceptors.request.use((config) => {
  const storeToken = useAuthStore.getState().accessToken;
  const cookieToken = getTokenFromCookie();
  const token = storeToken ?? cookieToken;
  console.log("[apiClient] store token:", storeToken ? storeToken.slice(0, 20) + "…" : null);
  console.log("[apiClient] cookie token:", cookieToken ? cookieToken.slice(0, 20) + "…" : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh and custom errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return the data object directly
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // const refreshed = await useAuthStore.getState().refreshToken();
      // For now, we'll just log it. A real implementation would call refreshToken.
      const refreshed = false; 
      if (refreshed) {
        return apiClient(originalRequest);
      }
      // If refresh fails, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    
    // You can add more custom error handling here, like for 403 plan upgrades.

    return Promise.reject(error.response?.data?.error || error);
  }
);

export default apiClient;
