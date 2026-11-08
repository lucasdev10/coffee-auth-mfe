import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Allow test files to import from 'coffee-shared-lib' by pointing Vite at the
      // TypeScript source of the library (same resolution the tsconfig paths use).
      'coffee-shared-lib': resolve(
        __dirname,
        '../coffee-shared-lib/projects/coffee-shared/src/public-api.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'text-summary', 'lcov'],
      reportsDirectory: './coverage/coffee-auth-mfe',
    },
  },
});
