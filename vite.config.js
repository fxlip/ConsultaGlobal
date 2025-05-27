import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import htmlFormatPlugin from './plugin-format'; // Seu plugin customizado
import fs from 'fs'; // Para ler o arquivo VERSION localmente

// Função para ler a versão localmente
function getLocalVersion() {
  const versionFilePath = path.resolve(__dirname, './VERSION');
  let version = 'N/A_FILE_NOT_FOUND'; // Valor padrão se o arquivo não for encontrado

  if (fs.existsSync(versionFilePath)) {
    try {
      const fileContent = fs.readFileSync(versionFilePath, 'utf-8').trim();
      // Pega apenas a primeira linha caso haja múltiplas
      const firstLineVersion = fileContent.split(/\r?\n/)[0]; 
      
      // Validação simples do formato da versão 
      if (firstLineVersion && /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$/.test(firstLineVersion)) {
        version = firstLineVersion;
        console.log(`Versão lida do arquivo local VERSION: ${version}`);
      } else {
        version = 'N/A_INVALID_FORMAT';
        console.warn(`Conteúdo do arquivo VERSION ('${firstLineVersion}') não parece ser uma versão válida. Usando fallback: ${version}`);
      }
    } catch (error) {
      version = 'N/A_READ_ERROR';
      console.error(`Erro ao ler o arquivo VERSION local:`, error);
      console.warn(`Usando versão de fallback: ${version}`);
    }
  } else {
    console.warn(`Arquivo de versão não encontrado em: ${versionFilePath}. Usando fallback: ${version}`);
  }
  return version;
}

export default defineConfig(({ command, mode }) => {
  const appVersion = getLocalVersion();

  return {
    plugins: [
      react(),
      htmlFormatPlugin()
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
      cssCodeSplit: false,
      minify: true,
      rollupOptions: {
        output: {
          entryFileNames: '[hash].js',
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
  };
});