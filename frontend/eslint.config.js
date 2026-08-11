const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const jsdocPlugin = require('eslint-plugin-jsdoc')

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
                }
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            jsdoc: jsdocPlugin
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
            'jsdoc/check-alignment': 'warn'
        }
    },
    {
        // Exempted in max-lines-exceptions.json: i18n translation dictionaries for multi-language support.
        files: ['src/i18n/translations.ts'],
        rules: {
            'max-lines': 'off'
        }
    }
]
