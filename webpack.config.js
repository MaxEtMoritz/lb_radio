// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve } from 'path';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import setup from './server/server.js'

const isProduction = process.env.NODE_ENV == 'production';
const __dirname = import.meta.dirname;

/** @type {import('webpack-dev-server').WebpackConfiguration} */
const config = {
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  output: {
    path: resolve(__dirname, 'client/dist'),
    assetModuleFilename: isProduction ? 'assets/[hash][ext][query]' : 'assets/[name][ext][query]',
    clean: true
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new HtmlBundlerPlugin({
      entry: {
        index: { import: 'client/index.html', data: { title: 'LB Radio' } },
        about: { import: 'client/about.html', data: { title: 'LB Radio' } }
      },
      js: {
        // output filename of compiled JavaScript
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
      },
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset/resource'
      }

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ]
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) =>{
      // register server's endpoints on devServer to use devServer in development
      if(!devServer)
      throw new Error('devServer is not defined')

      //if(module.hot)module.hot.accept()
      
      setup(devServer.app)

      return middlewares
    },
    watchFiles: ['client/src/**/*.js', 'server/**/*.js', 'client/**/*.html', 'client/**/*.css'],
  }
};

if (isProduction) {
  config.mode = 'production';
} else {
  config.mode = 'development';
}

export default config;
