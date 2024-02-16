const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_OPTIONS_API__': true,
        '__VUE_PROD_DEVTOOLS__': false,
        // Define aquí la flag '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__'
        // Si no sabes qué valor debe tener, usualmente se establece en 'false' para producción
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false
      })
    ]
  }
});
