module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'react-hooks/set-state-in-effect': 'off',
  },
};
