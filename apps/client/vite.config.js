import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // allowedHosts: ["my-tron-app-production.up.railway.app"]
    port: 3000
  }
})
