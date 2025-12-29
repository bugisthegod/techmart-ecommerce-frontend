/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.{ts,js}',
          '**/dist/',
          '**/*.test.{ts,tsx}',
          'src/api/**',
          'src/main.tsx',
          'src/vite-env.d.ts',
        ],
        include: [
          'src/services/**/*.ts',
          'src/lib/**/*.ts',
        ],
      },
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.cache'],
    },
  })
);
