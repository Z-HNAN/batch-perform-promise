import { defineConfig } from 'father';

export default defineConfig({
  esm: { input: 'src', output: 'dist/esm', transformer: 'babel' },
  cjs: { input: 'src', output: 'dist/cjs', transformer: 'babel' },
  umd: { entry: 'src/index', output: 'dist/umd', name: 'batchPerformPromise' },
});
