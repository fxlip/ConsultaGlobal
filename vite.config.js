import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import htmlFormatPlugin from './plugin-format';
import fs from 'fs';

const versionFilePath = path.resolve(__dirname, './VERSION'); // Alterado de './shared/VERSION'
let appVersion = 'N/A';

if (fs.existsSync(versionFilePath)) {
  appVersion = fs.readFileSync(versionFilePath, 'utf-8').trim();
} else {
  console.warn(`Arquivo de versão não encontrado em: ${versionFilePath}. Será usado 'N/A'.`);
  console.warn(`Certifique-se que o script de deploy baixa o arquivo VERSION para a raiz do projeto frontend.`);
}


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
    __APP_VERSION__: JSON.stringify(appVersion),
  },
});