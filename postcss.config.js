const AUTOPREFIXER_BROWSERS = [
  'last 2 years',
  'not < 0.05%'
]

module.exports = {
  plugins: [
    require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS })
  ]
}
