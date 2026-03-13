import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  // SECURITY: Do NOT add secret API keys to the `define` block.
  // Vite `define` inlines values into the client JS bundle, making them
  // readable by anyone who inspects the page source or network requests.
  // All Gemini / external API calls must go through a server-side proxy route.
  const _mode = mode; // retained to avoid unused-variable lint error
  void _mode;
  return {
    plugins: [react(), tailwindcss()],
    // `define` block intentionally empty — no secrets in the client bundle.
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
