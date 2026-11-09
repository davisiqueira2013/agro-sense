import { defineConfig } from 'vitest/config';

// Testes automatizados da API (Vitest + Supertest) contra um PostgreSQL real.
// Os arquivos rodam um de cada vez porque compartilham o mesmo banco de teste.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/global.ts'],
    setupFiles: ['tests/setup/env.ts'],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
