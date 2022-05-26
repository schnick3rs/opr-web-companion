module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    // sourceType: 'module',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
  ],
  plugins: [
    // 'html',
    'vuetify',
    // 'plugin:nuxt/recommended',
    // 'airbnb-base'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'import/extensions': ['error', 'never', {
      js: 'never',
      vue: 'never',
    }],
    'vue/valid-v-slot': 0,
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    'comma-dangle': ['error', 'only-multiline'],
    'semi': [2, 'always'],
    'quote-props': 0,
    'space-before-function-paren': 0,
  },
};
