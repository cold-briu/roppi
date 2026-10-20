// {29: literate/assembly.weft:17}

// Vite configuration
// {2: literate/04-scaffold.weft:58}

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    // The rope runs four physics substeps per frame, so its tests take seconds.
    testTimeout: 20000,
    include: ['src/**/*.test.ts'],
  },
});
// {:2}

// {:29}
