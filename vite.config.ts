import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    strictOrigin: false,
    proxy: {
      // API Transcription Endpoint
      '/v1/audio': {
        target: 'http://127.0.0.1:8005',
        changeOrigin: true,
        rewritePrefix: '/v1/audio',
        // Vite automatically adds CORS headers when changeOrigin is true
      },
      // Health Check Endpoint
      '/health': {
        target: 'http://127.0.0.1:8005',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
