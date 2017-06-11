import typescript from 'rollup-plugin-typescript';
import * as tsc from 'typescript';

export default {
    entry: 'src/index.ts',
    format: 'umd',
    dest: 'dist/bundle.js',
    moduleName: 'decoNg',

    plugins: [
        typescript({
            typescript: tsc,
        }),
    ],
};
