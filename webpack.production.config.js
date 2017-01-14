const path = require('path');
const webpack = require('webpack');

const BUILD_DIR = path.resolve(__dirname, 'public/javascripts')
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
    },
    plugins:[
        new webpack.DefinePlugin({
            'process.env':{
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress:{
                warnings: true
            },
            comments: false
        })
    ],
}

module.exports = config