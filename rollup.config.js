/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const rollupTypescript = require('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');
const merge = require('lodash.merge');
const pkg = require('./package.json');

const extensions = ['.js', '.ts'];

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};

// 打包配置
const jobs = {
  // 为了项目的统一性，这里读取 package.json 中的配置项
  cjs: {
    output: {
      format: 'cjs',
      file: resolve('./', pkg.main),
      exports: 'auto',
    },
  },
  esm: {
    output: {
      format: 'esm',
      file: resolve(pkg.module),
    },
  },
  umd: {
    output: {
      format: 'umd',
      file: resolve(pkg.unpkg),
      name: 'batchPerformPromise',
    },
  },
  min: {
    output: {
      format: 'umd',
      file: resolve(pkg.unpkg.replace(/(.\w+)$/, '.min$1')),
      name: 'batchPerformPromise',
    },
    plugins: [terser()],
  },
};

// 打包目录
const mergeConfig = jobs[process.env.FORMAT || 'esm'];

module.exports = merge(
  {
    input: resolve('./src/index.ts'),
    output: {},
    plugins: [
      nodeResolve({
        extensions,
        modulesOnly: true,
      }),
      rollupTypescript({
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
        extensions,
      }),
      commonjs({}),
    ],
  },
  mergeConfig,
);
