import create from 'zustand';
import { usersApi } from './api/users';

// This is a placeholder. You'll need to define the User type based on your API.
interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO';
}

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
      sessionStorage.setItem('auth_token', token);
      set({ accessToken: token });
      const user = await usersApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user with new token", error);
      get().logout();
    }
  },

  checkAuth: async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        set({ accessToken: token });
        const user = await usersApi.getMe();
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Token validation failed", error);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    sessionStorage.removeItem('auth_token');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
}));
