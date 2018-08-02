var JSON5 = require('json5')
var webpack = require('webpack')
var path = require('path')
var chalk = require('chalk')
var rules = require('./webpack.rules')
var Html = require('html-webpack-plugin')
var MiniCssExtract = require('mini-css-extract-plugin')
var Copy = require('copy-webpack-plugin')
var OptimizeCSS = require('optimize-css-assets-webpack-plugin')
var UglifyJs = require('uglifyjs-webpack-plugin')
var ProgressBar = require('progress-bar-webpack-plugin')
var ProgressiveManifest = require('webpack-pwa-manifest')
var Cleanup = require('webpack-cleanup-plugin')
var BundleSize = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin
var { encode } = require('msgpack-lite/lib/encode')
var { readFileSync } = require('fs')


rules.push({
  test: /\.scss$/,
  use: [
    MiniCssExtract.loader,
    'css-loader',
    'postcss-loader',
    'sass-loader',
  ],
  exclude: ['node_modules']
})

module.exports = {
  mode: 'production',
  entry: [
    './src/index.jsx',
    './styles/index.scss'
  ],
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx'],
    alias: {
      'lodash.throttle': 'lodash/throttle',
      'lodash.debounce': 'lodash/debounce'
    }
  },
  module: {
    rules
  },
  node: { Buffer: false },
  plugins: [
    new Cleanup(),
    new ProgressBar({
      format: '  ' + chalk.green.bold(':percent') + ' :elapseds :msg',
      renderThrottle: 10
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new UglifyJs({
      parallel: true,
      cache: true,
      extractComments: () => {}
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new MiniCssExtract({
      filename: '[name].[contenthash].css',
    }),
    new OptimizeCSS({
      cssProcessorOptions: {
        autoprefixer: true,
        rawCache: true,
        calc: true,
        colormin: true,
        convertValues: true,
        discardComments: { removeAll: true },
        discardDuplicates: true,
        discardEmpty: true,
        discardOverridden: true,
        discardUnused: true, // May be unsafe
        mergeIdents: true,
        mergeLonghand: true,
        mergeRules: true,
        minifyFontValues: true,
        minifyGradients: true,
        minifyParams: true,
        minifySelectors: true,
        normalizeCharset: true,
        normalizeDisplayValues: true,
        normalizePositions: true,
        normalizeRepeatStyle: true,
        normalizeString: {
          preferredQuote: 'single'
        },
        normalizeTimingFunctions: true,
        normalizeUnicode: true,
        normalizeUrl: true,
        normalizeWhitespace: true,
        orderedValues: true,
        reduceIdents: true, // May be unsafe
        reduceInitial: true,
        reduceTransforms: true,
        svgo: true,
        uniqueSelectors: true,
        zindex: true // May be unsafe
      }
    }),
    new Html({
      template: './src/template.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    new Copy([
      {
        from: 'data',
        to: 'data',
        transform: (content, file) => JSON.stringify(JSON5.parse(readFileSync(file, 'utf8')))
      },
      {
        from: 'data',
        to: 'msgpack',
        transform: (content, file) => encode(JSON5.parse(readFileSync(file, 'utf8')))
      },
      {
        from: 'static',
        to: '.',
        ignore: ['.*']
      }
    ]),
    new ProgressiveManifest({
      name: 'Kitsu Season Trends',
      short_name: 'Season Trends',
      description: 'Daily rating trends of seasonal anime',
      start_url: '.',
      display: 'standalone',
      theme_color: '#332532',
      background_color: '#332532',
      icons: [
        {
          src: path.resolve('src/favicon.png'),
          sizes: [ 16, 32, 96, 128, 192, 256, 512 ]
        }
      ],
      inject: true,
      fingerprints: false,
      filename: 'manifest.json',
      ios: true
    }),
    new BundleSize('../.bundlesize.yml')
  ]
}
