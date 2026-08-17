const path = require('node:path')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const jsdocPlugin = require('eslint-plugin-jsdoc')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const reactRefreshPlugin = require('eslint-plugin-react-refresh').default

module.exports = [
    {
        ignores: ['node_modules/**', 'dist/**', 'public/**', 'types/**', '__generated__/**']
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                },
                project: './tsconfig.json',
                tsconfigRootDir: path.resolve(__dirname)
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            jsdoc: jsdocPlugin,
            'react-hooks': reactHooksPlugin,
            'react-refresh': reactRefreshPlugin
        },
        rules: {
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
                }
            ],
            'jsdoc/check-alignment': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            eqeqeq: ['error', 'smart'],
            'no-console': ['error', { allow: ['warn', 'error'] }]
        }
    },
    {
        // Exempted in max-lines-exceptions.json: i18n translation dictionaries for multi-language support.
        files: ['src/i18n/translations.ts'],
        rules: {
            'max-lines': 'off'
        }
    },
    {
        // Test mocks routinely need to force partial/invalid shapes past the type system.
        files: ['src/**/*.test.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        // Context modules deliberately colocate a Provider component with its context object/hook
        // (idiomatic React context pattern) — that mix is exactly what this rule warns about.
        files: ['src/context/**/*.{ts,tsx}'],
        rules: {
            'react-refresh/only-export-components': 'off'
        }
    }
]
