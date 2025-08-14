// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Isso torna 'describe', 'it', 'expect' etc. disponíveis globalmente
    environment: 'node', // Essencial para testar um backend
  },
});