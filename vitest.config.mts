import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Business logic is plain TypeScript with no React Native imports, so it runs in node.
export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
});
