const path = require('node:path');
const js = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const jsdocPlugin = require('eslint-plugin-jsdoc');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactRefreshPlugin = require('eslint-plugin-react-refresh').default;
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', 'types/**', '__generated__/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: path.resolve(__dirname),
      },
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      jsdoc: jsdocPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,
      ...prettierConfig.rules,

      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'jsdoc/require-jsdoc': ['error', { publicOnly: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variableLike',
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: ['classProperty', 'typeProperty', 'accessor'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
      'jsdoc/check-alignment': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      eqeqeq: ['error', 'smart'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // TypeScript already reports undefined identifiers at compile time; no-undef
      // just re-flags valid ambient/global types and JSX namespaces as false positives.
      'no-undef': 'off',
    },
  },
  {
    // Exempted in max-lines-exceptions.json: translation dictionaries, large modals, and telemetry/parameter panels.
    files: ['src/i18n/translations.ts', 'src/components/StressTest/StressTestModal.tsx', 'src/components/ParameterControls/ParameterControls.tsx', 'src/components/StateDisplay/StateDisplay.tsx'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    // Test mocks routinely need to force partial/invalid shapes past the type system, and
    // `vi.fn()` references pulled off a mock object are already bound — unbound-method's
    // "this could be rebound" warning doesn't apply to them.
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    // Context modules deliberately colocate a Provider component with its context object/hook
    // (idiomatic React context pattern) — that mix is exactly what this rule warns about.
    files: ['src/context/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // ESM config files (import syntax) sit outside the tsconfig "include" (src-only),
    // so they can't use type-aware rules — lint them with the syntax-only TS ruleset.
    files: ['*.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
    },
  },
  {
    // CommonJS config files (require/module.exports) — same tooling, Node/CJS globals instead.
    files: ['*.config.js', '*.config.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,
    },
  },
];
