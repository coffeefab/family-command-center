import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy to GitHub Pages at https://<user>.github.io/family-command-center,
// set base to '/family-command-center/'. For local dev keep '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/family-command-center/' : '/'
})
