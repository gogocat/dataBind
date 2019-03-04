import babel from 'rollup-plugin-babel';
import {eslint} from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify-es';
import banner from 'rollup-plugin-banner';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/js/dataBind.min.js',
        format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: false,
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
        uglify(),
        banner(
            '<%= pkg.name %>\n' +
                'version <%= pkg.version %>\n' +
                'By <%= pkg.author %>\n' +
                'link <%= pkg.homepage %>\n' +
                'license <%= pkg.license %>\n'
        ),
    ],
};
