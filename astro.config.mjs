// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    resolve: {
      alias: {
        crypto: 'crypto-browserify',
      },
    },
    optimizeDeps: {
      include: ['crypto-browserify'],
    },
  },
});
