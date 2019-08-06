const path = require('path');

module.exports = {
  lintOnSave: false,

  configureWebpack: {
    module: {
     rules: [
      // this will apply to both plain `.scss` files
      // AND `<style lang="scss">` blocks in `.vue` files
      //{
      //  test: /\.scss$/,
      //  use: [
      //    'vue-style-loader',
      //    'css-loader',
      //    'postcss-loader',
      //    'sass-loader'
      //  ],
      //  include: path.resolve(__dirname, '../'),
      // }
     ]
   },
 },
}