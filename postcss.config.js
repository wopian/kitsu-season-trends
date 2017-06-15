const AUTOPREFIXER_BROWSERS = [
  'Android >= 57',
  'Chrome >= 57',
  'Firefox >= 53',
  'Explorer >= 11',
  'iOS >= 10',
  'Opera >= 43',
  'Safari >= 10',
];

module.exports = {
  plugins: [
    require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS })
  ]
}
