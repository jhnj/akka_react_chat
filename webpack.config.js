const path = require('path');
const webpack = require('webpack');

const BUILD_DIR = path.resolve(__dirname, 'public')
const APP_DIR = path.resolve(__dirname, 'app/assets/javascripts')

const config = {
  entry: APP_DIR + '/chat.es6.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel',
        include: APP_DIR
      }
    ]
  }
}

module.exports = config
