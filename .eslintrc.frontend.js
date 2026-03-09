/**
 * Конфигурация ESLint для фронтенда L_Shop
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: './src/frontend/tsconfig.json',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'max-len': ['error', { code: 100, ignoreUrls: true }],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'class-methods-use-this': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
    ],
    // Правила Airbnb для TypeScript
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForOfStatement',
        message: 'Используйте forEach, map, filter вместо for...of',
      },
    ],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    'no-useless-constructor': 'error',
    'no-return-assign': ['error', 'except-parens'],
    'no-param-reassign': ['error', { props: true }],
    'no-script-url': 'error',
    'no-alert': 'error',
    'no-restricted-globals': ['error', 'confirm'],
    'arrow-parens': ['error', 'always'],
    'padded-blocks': ['error', 'never'],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'max-classes-per-file': ['error', 1],
    '@typescript-eslint/indent': ['error', 2],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['**/__visual_tests__/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    '**/__tests__/**',
    '**/__visual_tests__/**',
    '**/node_modules/**',
    '**/dist/**',
  ],
};
