import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // Send /api requests to the Express server
    proxy: {
      '/api': 'http://localhost:4100',
    },
  },
})
