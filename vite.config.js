import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api/* to the Vercel dev server so `npm run dev` works locally.
    // Run `vercel dev` in a second terminal (default port 3000) before starting Vite.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
