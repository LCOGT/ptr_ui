
module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        // This produced 6mb(!!) of css!
        // data: `@import "@/style/buefy-styles.scss";`
      }
    }
  },
  devServer: {
    host: 'localhost'
  },

  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        }
      ]
    }
  },

  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compiler = require('vue-template-babel-compiler')
        return options
      })
  }
}
