import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base: the app works under any GitHub Pages path (hash routing keeps
// every route on the same index.html).
export default defineConfig({
  base: './',
  plugins: [react()],
})
