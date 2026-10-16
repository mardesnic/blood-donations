import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

// eslint-config-next 15 still ships the legacy format, so it is loaded
// through FlatCompat.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'coverage/**',
      'prisma/seed.ts',
    ],
  },
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    rules: {
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      'react-hooks/exhaustive-deps': 'off',
    },
  }
);
