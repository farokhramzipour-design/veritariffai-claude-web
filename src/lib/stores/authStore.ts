import create from 'zustand';

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
  login: (googleIdToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (googleIdToken) => {
    set({ isLoading: true });
    try {
      // const response = await fetch('/api/v1/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: googleIdToken }),
      // });
      // const { access_token, user } = await response.json();
      // sessionStorage.setItem('access_token', access_token);
      
      // Mock implementation for now
      const user: User = { id: '1', email: 'test@example.com', name: 'Test User', plan: 'FREE' };
      const accessToken = 'mock_access_token';
      sessionStorage.setItem('access_token', accessToken);

      set({ user, accessToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    // await fetch('/api/v1/auth/session', { method: 'DELETE' });
    sessionStorage.removeItem('access_token');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  refreshToken: async () => {
    // Implementation for refreshing the token would go here.
    // This would typically involve making a request to a refresh endpoint.
  },

  setUser: (user) => {
    set({ user });
  },
}));
