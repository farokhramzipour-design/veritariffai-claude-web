import apiClient from './client';

export const usersApi = {
  getMe: () => 
    apiClient.get('/api/v1/users/me'),
};
