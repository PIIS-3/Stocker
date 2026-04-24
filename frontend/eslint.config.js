// eslint.config.js — Configuración de ESLint para el frontend (Flat Config, ESLint v9+).
// ESLint revisa la LÓGICA del código: variables sin usar, malas prácticas, etc.
// Para formato visual (comillas, indentación...) se usa Prettier (.prettierrc).
//
// Ejecutar manualmente:
//   npm run lint           → muestra todos los errores y advertencias
//   npm run lint -- --fix  → intenta corregir automáticamente los que puede

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Ignora la carpeta dist/ (código compilado para producción, no tiene sentido lintarlo).
  globalIgnores(['dist']),
  {
    // Solo aplica a archivos TypeScript y TSX (componentes React).
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,               // Reglas base de JavaScript.
      tseslint.configs.recommended,          // Reglas de TypeScript (tipos, null-checks, etc.).
      reactHooks.configs.flat.recommended,   // Detecta uso incorrecto de Hooks de React.
      reactRefresh.configs.vite,             // Asegura que los componentes son compatibles con HMR de Vite.
    ],
    languageOptions: {
      ecmaVersion: 2020,         // Permite sintaxis moderna de JS (async/await, optional chaining...).
      globals: globals.browser,  // Reconoce variables globales del navegador (window, document, etc.).
    },
    rules: {
      // ── console.log ──────────────────────────────────────────────────
      // Avisa si se deja un console.log olvidado antes de hacer commit.
      // Solo se permiten console.warn y console.error para errores reales.
      // Para desactivar puntualmente: // eslint-disable-next-line no-console
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ── Variables no usadas ──────────────────────────────────────────
      // Desactivamos la regla base de JS (no entiende TypeScript) y
      // usamos la versión TypeScript, que permite ignorar variables cuyo
      // nombre empieza por '_' (convención para "ignorado intencionalmente").
      // Ejemplo: const [_ignoredState, setState] = useState()
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ── Imports de solo tipos ─────────────────────────────────────────
      // Obliga a usar 'import type' cuando solo se importan interfaces o tipos
      // de TypeScript (no valores en runtime). Esto permite a Vite eliminar
      // esas importaciones completamente al compilar, reduciendo el tamaño del bundle.
      // Ejemplo correcto:  import type { ApiStore } from '../types'
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  },
]);

