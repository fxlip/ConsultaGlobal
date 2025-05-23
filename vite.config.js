import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import htmlFormatPlugin from './plugin-format';
import fs from 'fs';
const version = fs.readFileSync('../VERSION', 'utf-8').trim();

export default defineConfig({
  plugins: [
    react(),
    htmlFormatPlugin() // Adicione o plugin aqui
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    emptyOutDir: true,
    cssCodeSplit: false, // Impede a divisão do CSS em múltiplos arquivos
    minify: true, // Mantém minificação
    rollupOptions: {
      output: {
        // Configura o nome dos arquivos JavaScript (apenas hash)
        entryFileNames: '[hash].js',
        
        // Configura o nome dos arquivos CSS ("styles" + hash)
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return '[hash].css';
          }
          return '[name].[hash][extname]';
        },
      },
    },
  },
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});