import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/dtos/**',
        '**/entities/**',
        '**/schemas/**',
        '**/validators/**',
        '**/*.dto.ts',
        '**/*.entity.ts',
        '**/*.schema.ts',
        '**/*.validator.ts',
        'src/shared/utils/**',
        'src/server.ts',
        'src/db.client.ts',
        'src/infrastructure/database/db.client.ts',
        'src/**/__test__/**',
        'src/**/tests/**',
        'src/**/_tests_/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'prisma/**',
        'vitest.config.ts',
        'node_modules/**',
        'dist/**',
      ],
    },
  },
});
