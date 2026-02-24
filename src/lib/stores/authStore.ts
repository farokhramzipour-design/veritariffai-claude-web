import create from 'zustand';
import { usersApi } from '../api/users';
import type { User } from '@/types/user';

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
      // 1. Fetch user data with the new token immediately
      const user = await usersApi.getMe(token);
      
      // 2. If successful, update the state and sessionStorage
      sessionStorage.setItem('auth_token', token);
      set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user with new token", error);
      get().logout(); // This will clear any invalid state
    }
  },

  checkAuth: async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        // 1. Fetch user data with the stored token to validate it
        const user = await usersApi.getMe(token);
        
        // 2. If successful, update the state
        set({ user, accessToken: token, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Stored token is invalid", error);
      get().logout(); // Clear the invalid token
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    sessionStorage.removeItem('auth_token');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
}));
