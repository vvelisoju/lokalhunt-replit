module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@eslint/js/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@babel/eslint-parser',
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': ['warn'],
    'no-console': ['warn'],
  },
}