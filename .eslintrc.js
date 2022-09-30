module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/recommended', // for Vue 2.x
    'standard'
  ],
  globals: {
    "A": true, // Aladin script
    "JS9": true,
    "$": true,
    "d3": true,
    "google": true,
    "OverlappingMarkerSpiderfier": true,
  },
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    "camelcase": "off",
    "eqeqeq": "off",
    "brace-style": "off",
    "vue/require-prop-type-constructor": "off",
    "vue/prop-name-casing": "off",
    "vue/require-default-prop": "off",
    "vue/require-prop-types": "off",
    "vue/order-in-components": "off",
    "vue/multi-word-component-names": "off",
  }
}
