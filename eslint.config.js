import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    // Base recommended configs
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // JavaScript and TypeScript files - general rules
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                // Test globals
                dataBind: 'readonly',
                loadFixture: 'readonly',
                simulateInput: 'readonly',
                simulateClick: 'readonly',
                simulateBlur: 'readonly',
            },
        },
        rules: {
            // Code Style
            'indent': ['error', 4, {SwitchCase: 1}],
            'linebreak-style': 'off',
            'quotes': ['error', 'single', {avoidEscape: true, allowTemplateLiterals: true}],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'comma-spacing': ['error', {before: false, after: true}],
            'key-spacing': ['error', {beforeColon: false, afterColon: true}],
            'object-curly-spacing': ['error', 'never'],
            'array-bracket-spacing': ['error', 'never'],
            'space-before-function-paren': ['error', {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always',
            }],
            'space-in-parens': ['error', 'never'],
            'space-before-blocks': ['error', 'always'],
            'keyword-spacing': ['error', {before: true, after: true}],
            'arrow-spacing': ['error', {before: true, after: true}],
            'no-multiple-empty-lines': ['error', {max: 2, maxEOF: 1}],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],

            // Max Length
            'max-len': ['error', {
                code: 150,
                tabWidth: 4,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
                ignorePattern: 'data:image/|\\s*require\\s*\\(|^\\s*loader\\.lazy|-\\*-|^import\\s',
            }],

            // Best Practices
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-arrow-callback': 'warn',
            'prefer-template': 'warn',
            'object-shorthand': ['warn', 'always'],
            'no-useless-escape': 'off',
            'no-prototype-builtins': 'off',
            'prefer-rest-params': 'off',

            // Variables
            'no-unused-vars': 'off', // Use TypeScript version instead

            // TypeScript Rules
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // Security
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error',
        },
    },

    // Test files - more relaxed rules
    {
        files: ['test/**/*.{js,ts}', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'max-len': ['error', {
                code: 200, // Allow longer lines in tests
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            }],
        },
    },

    // Ignore patterns
    {
        ignores: [
            'node_modules',
            'dist',
            'coverage',
            'vendors',
            '.grunt',
            '*.min.js',
            '*.bundle.js',
        ],
    },
];
