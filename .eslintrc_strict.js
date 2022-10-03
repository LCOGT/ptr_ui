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
    "_chatlio": true,
  },
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    'no-autofix',
  ],
  rules: {
    "camelcase": "off",
    //"eqeqeq": "off",
    "brace-style": "off",
    "vue/require-prop-type-constructor": "off",
    "vue/prop-name-casing": "off",
    "vue/require-default-prop": "off",
    "vue/require-prop-types": "off",
    "vue/order-in-components": "off",
    "vue/multi-word-component-names": "off",

    /* Don't automatically fix these when running `eslint --fix`, but keep the warning/error */

    // This autofix induced breaking changes when props are named with a mix of camelCase and snake_case, 
    // such as in SiteCalendar by changing the prop for TheCalendar (fc_timeZone) 
    // from 'fc_timeZone' to 'fc-time-zone'
    "vue/attribute-hyphenation": "off",
    "no-autofix/vue/attribute-hyphenation": "error",
  }
}
