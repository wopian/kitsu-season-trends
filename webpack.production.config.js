var webpack = require('webpack')
var path = require('path')
var chalk = require('chalk')
var loaders = require('./webpack.loaders')
var Html = require('html-webpack-plugin')
var ExtractText = require('extract-text-webpack-plugin')
var Favicons = require('favicons-webpack-plugin')
var Copy = require('copy-webpack-plugin')
var OptimizeCSS = require('optimize-css-assets-webpack-plugin')
var UglifyJs = require('uglifyjs-webpack-plugin')
var ProgressBar = require('progress-bar-webpack-plugin')
var ProgressiveManifest = require('webpack-pwa-manifest')
var Cleanup = require('webpack-cleanup-plugin')
var BundleSize = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin
var { encode } = require('msgpack-lite/lib/encode')
var { readFileSync } = require('fs')


loaders.push({
  test: /\.scss$/,
  loader: ExtractText.extract({fallback: 'style-loader', use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded'}),
  exclude: ['node_modules']
})

module.exports = {
  entry: [
    './src/index.jsx',
    './styles/index.scss'
  ],
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'public'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders
  },
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
      cache: true
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractText({
      filename: '[name].[contenthash].css',
    }),
    new OptimizeCSS({
      cssProcessorOptions: {
        autoprefixer: true,
        rawCache: true,
        calc: true,
        colormin: true,
        convertValues: true,
        discardComments: true,
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
    // keep module.id stable when vender modules does not change
    new webpack.HashedModuleIdsPlugin(),
    /*
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      async: 'common',
      minChunks: 1
    }),
    */
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, 'node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    /* Does not support Webpack 3 yet
    new Favicons({
      logo: './src/favicon.png',
      prefix: 'icons/',
      inject: true,
      title: 'Kitsu Season Trends',
      background: 'transparent',
      persistentCache: true
    }),
    */
    new Copy([
      {
        from: 'data',
        to: 'data',
        transform: (content, file) => JSON.stringify(JSON.parse(readFileSync(file, 'utf8')))
      },
      {
        from: 'data',
        to: 'msgpack',
        transform: (content, file) => encode(JSON.parse(readFileSync(file, 'utf8')))
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
      fingerprints: true,
      ios: true
    }),
    new BundleSize('../.bundlesize.yml')
  ]
}
