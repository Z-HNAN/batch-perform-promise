import { defineConfig } from 'father';

export default defineConfig({
  esm: { input: 'src', output: 'dist/esm' },
  cjs: { input: 'src', output: 'dist/cjs' },
  umd: { entry: 'src/index', output: 'dist/umd', name: 'batchPerformPromise' },
});
