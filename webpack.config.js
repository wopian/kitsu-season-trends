var JSON5 = require('json5')
var Html = require('html-webpack-plugin')
var Dashboard = require('webpack-dashboard/plugin')
var Copy = require('copy-webpack-plugin')
var MiniCssExtract = require('mini-css-extract-plugin')
var { encode } = require('msgpack-lite/lib/encode')
var { readFileSync } = require('fs')
var rules = require('./webpack.rules')

rules.push({
  test: /\.styl$/,
  use: ['style-loader', 'css-loader?importLoaders=true', 'stylus-loader'],
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
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx']
  },
  module: {
    rules
  },
  plugins: [
    new MiniCssExtract({
      filename: 'style.css'
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
          from: 'data/*.json5',
          to: 'msgpack/[name].msgpack',
          transform: (content, file) => encode(JSON5.parse(readFileSync(file, 'utf8')))
        },
      ]
    })
  ],
  optimization: {
    emitOnErrors: true
  },
  devServer: {
    historyApiFallback: true,
    hot: true
  }
}
