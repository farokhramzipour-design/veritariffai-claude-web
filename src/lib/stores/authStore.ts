import { create } from 'zustand';
import { usersApi } from '../api/users';
import type { User } from '@/types/user';

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name: string) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setToken: (token: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setToken: async (token: string) => {
    set({ isLoading: true });
    try {
      const user = await usersApi.getMe(token);
      setCookie('auth_token', token, 7); // Store token in a cookie for 7 days
      set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user with new token", error);
      get().logout();
    }
  },

  checkAuth: async () => {
    try {
      const token = getCookie('auth_token');
      if (token) {
        const user = await usersApi.getMe(token);
        set({ user, accessToken: token, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Stored token is invalid", error);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    eraseCookie('auth_token');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
}));
