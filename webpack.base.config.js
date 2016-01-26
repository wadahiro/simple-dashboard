var webpack = require('webpack')

var path = require('path')
var objectAssign = require('object-assign')

var NODE_ENV = process.env.NODE_ENV

var env = {
  production: NODE_ENV === 'production',
  staging: NODE_ENV === 'staging',
  test: NODE_ENV === 'test',
  development: NODE_ENV === 'development' || typeof NODE_ENV === 'undefined'
}

objectAssign(env, {
  build: (env.production || env.staging)
})

module.exports = {
  target: 'web',
  entry: ['./src/index.tsx'],
  output: {
    path: path.join(__dirname, 'public/js'),
    publicPath: '/js/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        cacheDirectory: true,
        exclude: [/node_modules/],
        loader: 'babel-loader?presets[]=es2015&presets[]=react'
      },
      {
        test: /\.ts(x?)$/,
        cacheDirectory: true,
        exclude: [/node_modules/],
        loader: 'babel-loader?presets[]=es2015&presets[]=react!ts-loader'
      }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.tsx', '.ts', '.js']
  },
  externals: {
    'underscore': '_'
  },
  plugins: [
  ],
  cache: true
}
