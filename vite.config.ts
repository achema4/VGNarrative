import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'VGNarrative',
        short_name: 'VGNarrative',
        description: 'Editor narrativo multiplataforma',
        theme_color: '#3157a4',
        background_color: '#f4f6f8',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: './icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ]
});
