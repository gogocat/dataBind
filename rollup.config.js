import babel from 'rollup-plugin-babel';
import {eslint} from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify-es';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/js/dataBind.min.js',
        format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: true,
    },
    plugins: [
        eslint({
            parser: 'babel-eslint',
            parserOptions: {
                ecmaVersion: 6,
                ecmaFeatures: {
                    modules: true,
                },
            },
            rules: {
                quotes: [1, 'single'],
                semi: [1],
            },
        }),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true,
            presets: ['@babel/preset-env'],
            plugins: ['transform-es3-member-expression-literals', 'transform-es3-property-literals'],
        }),
        uglify(), // minify
    ],
};
