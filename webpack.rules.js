module.exports = [
  {
    test: /\.jsx?$/,
    exclude: [/(node_modules|public\/)/],
    use: 'babel-loader'
  },
  {
    test: /\.jsx?$/,
    include: /node_modules/,
    use: 'react-hot-loader/webpack'
  },
  {
    test: /\.css$/,
    exclude: [/node_modules/],
    use: ['style-loader', 'css-loader?importLoaders=true'],
  },
  {
    test: /\.(woff|woff2)$/,
    exclude: [/node_modules/],
    type: 'asset/resource',
    generator: {
      filename: 'font/[contenthash][ext][query]'
    }
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    exclude: [/node_modules/],
    type: 'asset/resource',
    mimetype: 'application/octet-stream',
    generator: {
      filename: 'font/[contenthash][ext][query]'
    }
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    exclude: [/node_modules/],
    type: 'asset/resource',
    mimetype: 'image/svg+xml',
  },
  {
    test: /\.gif/,
    exclude: [/node_modules/],
    type: 'asset/resource',
    mimetype: 'image/gif',
  },
  {
    test: /\.jpg/,
    exclude: [/node_modules/],
    type: 'asset/resource',
    mimetype: 'image/jpg',
  },
  {
    test: /\.png/,
    exclude: [/node_modules/],
    type: 'asset/resource',
    mimetype: 'image/png',
  }
];
