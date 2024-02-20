/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'standard',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'camelcase': 'off',
    'no-console': [1, { allow: ['error', 'warn', 'info'] }],
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
  },
}
