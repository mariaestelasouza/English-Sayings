import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


const usageServer = 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': usageServer,
      '/admin': usageServer,
    },
  },
});
