import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
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
        input: 'src/index.js',
        output: {
            file: 'dist/js/dataBind.js',
            format: 'umd',
            name: 'dataBind',
            sourcemap: false,
        },
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    '@version@': pkg.version,
                },
            }),
            babel({
                babelHelpers: 'bundled',
            }),
            banner2(() => bannerText),
        ],
    },
    // UMD build (minified)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/js/dataBind.min.js',
            format: 'umd',
            name: 'dataBind',
            sourcemap: true,
        },
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    '@version@': pkg.version,
                },
            }),
            babel({
                babelHelpers: 'bundled',
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
