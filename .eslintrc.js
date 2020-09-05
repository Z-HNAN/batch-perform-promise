module.exports = {
  extends: [
    'airbnb-typescript/base',
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  rules: {
    'linebreak-style': 0,
    'no-console': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'class-methods-use-this': 0,
    'prefer-template': 0,
    'no-param-reassign': 0,
    'object-curly-newline': 0,
    'func-names': 0,
    // "import/extensions": [ "error", "ignorePackages", { js: "never", jsx: "never", ts: "never", tsx: "never" } ]
    // "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", ".tsx"] }]
  }
}