import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ── Reglas de consistencia para reducir conflictos de merge ────
      // Avisa si se usa console.log (solo permite warn y error) para
      // evitar que se suban logs de depuración al repositorio.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Desactiva la regla base de JS para variables no usadas y usa
      // la de TypeScript, que permite ignorar variables con prefijo '_'.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Obliga a usar 'import type' cuando solo se importan tipos.
      // Mejora el rendimiento del bundle y evita importaciones circulares.
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  },
]);
