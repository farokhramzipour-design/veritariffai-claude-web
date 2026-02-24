import apiClient from './client';

export const usersApi = {
  getMe: (token: string) => 
    apiClient.get('/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
