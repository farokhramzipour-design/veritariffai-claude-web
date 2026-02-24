import apiClient from './client';
import type { User } from '@/types/user';

export const usersApi = {
  getMe: (token: string): Promise<User> =>
    apiClient.get('/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
