import babel from '@rollup/plugin-babel';
import banner from 'rollup-plugin-banner';

// eslint-disable-next-line no-unused-vars
const pkg = require('./package.json');

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/js/dataBind.js',
        format: 'umd', // Browser + Node.js
        name: 'dataBind',
        sourcemap: false,
    },
    plugins: [
        banner(
            '<%= pkg.name %>\n' +
            'version <%= pkg.version %>\n' +
            'By <%= pkg.author %>\n' +
            'link <%= pkg.homepage %>\n' +
            'license <%= pkg.license %>\n',
        ),
        babel({
            babelHelpers: 'bundled',
        }),
    ],
};
