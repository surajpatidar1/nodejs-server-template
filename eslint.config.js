import eslint from '@eslint/js';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/generated/**',
      'uploads/**',
      'coverage/**',
    ],
  },

  eslint.configs.recommended,
];
