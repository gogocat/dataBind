import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
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
            'indent': ['error', 4],
            'linebreak-style': 0,
            'max-len': [
                'error',
                {
                    code: 150,
                    ignoreUrls: true,
                    ignorePattern: 'data:image/|\\s*require\\s*\\(|^\\s*loader\\.lazy|-\\*-',
                },
            ],
            'quotes': ['warn', 'single'],
            'semi': ['warn', 'always'],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'no-useless-escape': 'off',
            'no-prototype-builtins': 'off',
            'prefer-rest-params': 'off',
        },
    },
    {
        ignores: ['node_modules', 'dist', 'coverage', 'vendors', '.grunt'],
    },
];
