import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base can be overridden at build time for OSS/CDN sub-path deploys, e.g.
//   VITE_PUBLIC_BASE=/childvideo/ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_PUBLIC_BASE || '/',
  server: {
    port: 5173,
    host: true,
  },
})
