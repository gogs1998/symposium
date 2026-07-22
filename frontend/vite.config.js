import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
