import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /green-book-texas-1956/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/green-book-texas-1956/' : '/',
}));
