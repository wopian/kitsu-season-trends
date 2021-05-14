var JSON5 = require('json5')
var webpack = require('webpack')
var path = require('path')
var rules = require('./webpack.rules')
var Html = require('html-webpack-plugin')
var ResourceHints = require('resource-hints-webpack-plugin')
var MiniCssExtract = require('mini-css-extract-plugin')
var Copy = require('copy-webpack-plugin')
var CssMinimizer = require('css-minimizer-webpack-plugin')
var ProgressiveManifest = require('webpack-pwa-manifest')
var Terser = require('terser-webpack-plugin')
var { GenerateSW } = require('workbox-webpack-plugin')
var { encode } = require('msgpack-lite/lib/encode')
var { readFileSync } = require('fs')

rules.push({
  test: /\.styl$/,
  use: [MiniCssExtract.loader, 'css-loader', 'stylus-loader'],
  exclude: [/node_modules/]
})

module.exports = {
  mode: 'production',
  entry: [
    './src/index.jsx',
    './styles/index.styl'
  ],
  output: {
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
    clean: true
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx']
  },
  module: {
    rules
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new MiniCssExtract({
      filename: '[name].[contenthash].css',
    }),
    new Html({
      template: './src/template.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    new ResourceHints(),
    new Copy({
      patterns: [
        {
          from: 'data/*.json5',
          to: 'data/[name].json',
          transform: (content, file) => JSON.stringify(JSON5.parse(readFileSync(file, 'utf8')))
        },
        {
          from: 'data/*.json5',
          to: 'msgpack/[name].msgpack',
          transform: (content, file) => encode(JSON5.parse(readFileSync(file, 'utf8')))
        },
        {
          from: 'static',
          to: '.',
          globOptions: { ignore: ['.*'] }
        }
      ]
    }),
    new ProgressiveManifest({
      name: 'Kitsu Season Trends',
      short_name: 'Season Trend',
      description: 'Daily rating trends of seasonal anime',
      start_url: '.',
      display: 'standalone',
      theme_color: '#332532',
      background_color: '#332532',
      crossorigin: 'anonymous',
      icons: [
        {
          src: path.resolve('src/favicon.png'),
          sizes: [ 16, 32, 96, 128, 192, 256, 512 ]
        },
        {
          src: path.resolve('src/favicon.png'),
          sizes: [ 192 ],
          ios: true
        }
      ],
      inject: true,
      fingerprints: false,
      ios: true
    }),
    new GenerateSW({
      cacheId: 'kitsu-season-trends',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      // dontCacheBustURLsMatching: /\.\w{8}\./,
      inlineWorkboxRuntime: false,
      navigateFallback: '/',
      swDest: 'service-worker.js',
      exclude: [
        /\.map$/,
        /asset-manifest\.json$/,
        /\.json5$/,
        /(?:autumn|spring|summer|winter)\.json$/,
        // /\.msgpack$/,
        /_headers$/,
        /_redirects$/
      ],
      runtimeCaching: [
        {
          urlPattern: /\/$/,
          handler: 'NetworkFirst'
        }
      ]
    })
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: module => `vendor.${module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]}`
        }
      }
    },
    moduleIds: 'deterministic',
    emitOnErrors: true,
    minimize: true,
    minimizer: [
      new Terser({
        parallel: true,
        extractComments: () => {}
      }),
      new CssMinimizer({
        minimizerOptions: {
          preset: [
            'default',
            {
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
          ]
        }
      })
    ]
  },
  performance: {
    assetFilter: assetFilename => !(
      assetFilename.startsWith('data') || assetFilename.startsWith('msgpack')
    )
  }
}
