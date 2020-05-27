var webpack = require('webpack')
var path = require('path')
var rules = require('./webpack.rules')
var Html = require('html-webpack-plugin')
var Dashboard = require('webpack-dashboard/plugin')
var MiniCssExtract = require('mini-css-extract-plugin')
var Copy = require('copy-webpack-plugin')
var history = require('connect-history-api-fallback')
var convert = require('koa-connect')

var JSON5 = require('json5')
var { readFileSync } = require('fs')
var { encode } = require('msgpack-lite/lib/encode')

rules.push({
  test: /\.styl$/,
  loaders: ['style-loader', 'css-loader?importLoaders=true', 'stylus-loader'],
  exclude: [/node_modules/]
})

module.exports = {
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    './src/index.jsx', // your app's entry point
  ],
  devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx']
  },
  module: {
    rules
  },
  node: { Buffer: false },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new MiniCssExtract({
      filename: 'style.css',
      allChunks: true
    }),
    new Dashboard(),
    new Html({
      template: './src/template.html',
      files: {
        css: ['style.css'],
        js: [ "bundle.js"],
      }
    }),
    new Copy({
      patterns: [
        {
          from: 'data',
          to: 'data',
          transform: (content, file) => JSON.stringify(JSON5.parse(readFileSync(file, 'utf8')))
        },
        {
          from: 'data',
          to: 'msgpack',
          transform: (content, file) => encode(JSON5.parse(readFileSync(file, 'utf8')))
        }
      ]
    })
  ]
}

module.exports.serve = {
  add: app => {
    app.use(convert(history({})))
  }
}
