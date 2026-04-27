/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Unfonts from 'unplugin-fonts/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      google: {
        families: [
          {
            name: 'Inter',
            styles: 'wght@300;400;500;600;700',
          },
        ],
      },
    }),
  ],
  // Configuración de pruebas con Vitest
  test: {
    // Habilita APIs globales como 'describe', 'it', 'expect' para no tener que importarlas en cada archivo
    globals: true,
    // Simula un entorno de navegador en Node.js usando jsdom
    environment: 'jsdom',
    // Archivo de configuración que se ejecuta antes de cada prueba
    setupFiles: './src/vitest-setup.ts',
  },
});
