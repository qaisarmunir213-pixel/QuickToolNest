
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: 'index.html',
        admin: 'admin.html',
        about: 'about.html',
        contact: 'contact.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        disclaimer: 'disclaimer.html'
      }
    }
  }
})
