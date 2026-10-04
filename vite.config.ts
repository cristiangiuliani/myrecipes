import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // A new deploy activates on the next load, no "update available" prompt
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'Ricette di Famiglia',
        short_name: 'Ricette',
        description: 'Le ricette di famiglia, sempre a portata di mano in cucina.',
        lang: 'it',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#f5f5f5',
        background_color: '#ffffff',
        // Generated from public/logo.svg by `yarn generate-pwa-assets`
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell only; fonts, recipe data and photos are cached at runtime below
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['images/**'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Always try for the latest recipes, fall back to the cached copy offline
            urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'recipe-data', networkTimeoutSeconds: 5 },
          },
          {
            // Show the cached photo immediately, refresh it in the background (a photo can be replaced under the same name)
            urlPattern: ({ url }) => url.pathname.startsWith('/images/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'recipe-photos',
              expiration: { maxEntries: 200 },
              plugins: [
                {
                  // Hosting answers a missing photo with index.html (SPA rewrite): don't cache that as a photo
                  cacheWillUpdate: async ({ response }) =>
                    response.ok && response.headers.get('content-type')?.startsWith('image/') ? response : null,
                },
              ],
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 60 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
