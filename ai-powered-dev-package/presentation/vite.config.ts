import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/ui': path.resolve(__dirname, '../../libs/shared-web/src'),
    },
  },
  server: {
    port: 5180,
    fs: {
      allow: ['../..'],
    },
  },
})
