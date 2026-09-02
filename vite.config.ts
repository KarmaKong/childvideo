import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Base can be overridden at build time for OSS/CDN sub-path deploys, e.g.
//   VITE_PUBLIC_BASE=/childvideo/ npm run build
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const jfOrigin = env.VITE_JELLYFIN_ORIGIN
  const jfBase = env.VITE_JELLYFIN_BASE || '/jf'

  return {
    plugins: [react()],
    base: env.VITE_PUBLIC_BASE || '/',
    server: {
      port: 5173,
      host: true,
      // 本地开发对接远端 Jellyfin：把 /jf 代理过去，绕开 CORS
      proxy:
        jfOrigin && jfBase.startsWith('/')
          ? {
              [jfBase]: {
                target: jfOrigin,
                changeOrigin: true,
                ws: true,
                rewrite: (p: string) => p.replace(new RegExp(`^${jfBase}`), ''),
              },
            }
          : undefined,
    },
  }
})
