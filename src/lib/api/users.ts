import apiClient from './client';
import type { User } from '@/types/user';

export const usersApi = {
  getMe: (token: string): Promise<User> =>
    apiClient.get('/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updateMe: (token: string, data: Partial<User>): Promise<User> =>
    apiClient.patch('/api/v1/users/me', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
