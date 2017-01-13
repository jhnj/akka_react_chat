const path = require('path');
const webpack = require('webpack');

const BUILD_DIR = path.resolve(__dirname, 'public')
const APP_DIR = path.resolve(__dirname, 'app/assets/javascripts')

const config = {
  entry: APP_DIR + '/chatApp.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'ChatApp'
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
