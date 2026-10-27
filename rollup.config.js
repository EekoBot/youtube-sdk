import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      // tsc (the compile script's previous step) already emits the .d.ts files;
      // this pass only transpiles for the two bundles.
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        outDir: undefined
      })
    ],
    external: ['node-fetch', 'zod']
  }
];
