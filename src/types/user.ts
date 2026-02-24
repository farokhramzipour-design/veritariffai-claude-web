// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO';
  // Add any other properties returned by your /api/v1/users/me endpoint
}
