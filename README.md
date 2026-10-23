# QuickToolNest GitHub Import Package

This repository preserves the standalone HTML pages and includes a basic Vite project configuration plus a separate Cloudflare Worker/D1 starter folder.

## GitHub upload
Upload the **contents** of this extracted folder to the repository root, preserving the `src/` and `worker/` folders. Do not upload the ZIP itself as the site source.

## Cloudflare Pages
If using the Vite build, set build command to `npm run build` and output directory to `dist`. If your existing Cloudflare Pages project uses direct static upload, upload the built `dist` contents instead. Do not change deployment settings until checking the current project configuration.

## Worker backend
The Worker is separate from Pages. Follow `worker/README.md`; the presence of these files in GitHub does not deploy the Worker or initialize D1 automatically.
