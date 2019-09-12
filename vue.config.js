const path = require('path');

module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/style/buefy-styles.scss";`
      }
    }
  },

  configureWebpack: {
    module: {
     rules: []
   },
 },
}