import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import banner2 from 'rollup-plugin-banner2';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const bannerText = `${pkg.name}
version ${pkg.version}
By ${pkg.author}
link ${pkg.homepage}
license ${pkg.license}`;

export default [
    // UMD build (unminified)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/js/dataBind.js',
            format: 'umd',
            name: 'dataBind',
            sourcemap: false,
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                declaration: true,
                compilerOptions: {
                    outDir: './dist/js',
                    declarationDir: './dist/js/types',
                }
            }),
            replace({
                preventAssignment: true,
                values: {
                    '@version@': pkg.version,
                },
            }),
            babel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.ts'],
            }),
            banner2(() => bannerText),
        ],
    },
    // UMD build (minified)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/js/dataBind.min.js',
            format: 'umd',
            name: 'dataBind',
            sourcemap: true,
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                compilerOptions: {
                    outDir: './dist/js',
                }
            }),
            replace({
                preventAssignment: true,
                values: {
                    '@version@': pkg.version,
                },
            }),
            babel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.ts'],
            }),
            terser({
                format: {
                    comments: false,
                    preamble: `/* ${bannerText.replace(/\n/g, ' | ')} */`,
                },
            }),
        ],
    },
];
