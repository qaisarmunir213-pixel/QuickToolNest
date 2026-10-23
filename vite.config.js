import { defineConfig } from 'vite';

export default defineConfig({
  // The static HTML pages are kept at the repository root.
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        about: 'about.html',
        contact: 'contact.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        disclaimer: 'disclaimer.html'
      }
    }
  }
});
