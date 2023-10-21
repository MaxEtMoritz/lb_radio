// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const config = {
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'client/dist'),
    assetModuleFilename: isProduction ? 'assets/[hash][ext][query]' : 'assets/[name][ext][query]'
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
  }
};

module.exports = config;
