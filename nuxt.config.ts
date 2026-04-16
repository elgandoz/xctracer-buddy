export default defineNuxtConfig({
  compatibilityDate: '2026-04-16',
  ssr: false,
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: [],
  nitro: { preset: 'static' },
  vite: {
    define: { 'process.env.NODE_ENV': '"production"' }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'XCTracer Buddy Manager',
      short_name: 'BuddyMgr',
      description: 'Manage your XCTracer Maxx buddy list',
      theme_color: '#0ea5e9',
      background_color: '#0f172a',
      display: 'standalone',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,ico}'] }
  }
})
