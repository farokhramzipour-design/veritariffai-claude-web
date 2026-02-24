import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to inject the auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
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
