import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: 'src/index.ts',
    output: 'index',
    format: 'esm',
    dts: true,
    sourcemap: true,
});
