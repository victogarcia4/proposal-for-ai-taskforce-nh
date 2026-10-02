import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import netlify from '@netlify/vite-plugin-tanstack-start';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ command, mode }) => ({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // Standard/Lovable previews must not require Netlify account configuration.
  // Always include the deployment adapter in builds; opt into local platform
  // emulation explicitly with `npm run dev:netlify`.
  plugins: [tanstackStart(), ...(command === 'build' || mode === 'netlify' ? [netlify()] : []), react()],
}));
