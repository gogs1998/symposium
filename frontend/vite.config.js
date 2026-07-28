import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 3200, not 3000: the ConflictIQ project owns 3000 on this machine, and the
    // hardcoded 3000 meant Symposium's dev server silently failed to bind. 3200
    // keeps both runnable at once.
    port: 3200,
    // Accept tunnel hostnames (trycloudflare) for remote viewing; dev convenience.
    allowedHosts: true,
    // Native FS watching crashes on this Windows setup (UNKNOWN errno -4094); poll instead.
    watch: { usePolling: true, interval: 400 },
    proxy: {
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
