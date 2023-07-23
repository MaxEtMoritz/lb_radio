// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const config = {
  entry: './client/src/index.js',
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
        filename: 'main.js'
      }
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
        type: 'asset'
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

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
