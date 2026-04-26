module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      env: {
        es6: true,
        node: true,
        browser: true,
      },
    },
  ],
};
