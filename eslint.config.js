import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
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
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    {
        ignores: ['node_modules', 'dist', 'coverage', 'vendors', '.grunt'],
    },
];
