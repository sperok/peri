/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Peri',
        short_name: 'Peri',
        description: 'Predictive phrase completion for fast, low-effort communication.',
        theme_color: '#1e1b4b',
        background_color: '#1e1b4b',
        display: 'standalone',
        icons: [
          {
            // TODO: replace with real raster icons before shipping;
            // favicon.svg is a placeholder so the manifest is valid.
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        // STT model assets can be large; cache them explicitly once added.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  server: {
    // Fixed, uncommon port with strictPort so a collision with another
    // project's dev server fails loudly instead of silently rebinding
    // elsewhere (which happened during initial scaffolding and broke the
    // assumption other tooling, e.g. Playwright's webServer, relies on).
    port: 5183,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
