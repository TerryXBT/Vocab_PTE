import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hash-based routing keeps GitHub Pages refreshes working without extra server config.
export default defineConfig({
  plugins: [react()],
  // Use repository name for correct asset paths on GitHub Pages.
  base: '/Vocab_PTE/'
});
