import { defineConfig, type UserConfig } from 'vite';
import { type UserConfig as VitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Merge the Vite and Vitest config types
const config: UserConfig & { test: VitestConfig['test'] } = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
};

export default defineConfig(config);
