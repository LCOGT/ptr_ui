const path = require('path');

module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        // This produced 6mb(!!) of css! 
        //data: `@import "@/style/buefy-styles.scss";`
      }
    }
  },

  configureWebpack: {
    module: {
     rules: [
       {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
     ]
   },
 },
}