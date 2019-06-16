const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const { TARGET } = process.env;
const ROOT_PATH = path.resolve(__dirname);

/* eslint-disable security/detect-unsafe-regex */

/**
 * @type {import('webpack').Configuration}
 */
const common = {
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        query: {
          presets: ['env', 'react', 'stage-0'],
        },
      },
    },
    {
      test: /\.json$/,
      loaders: ['json'],
    },
    {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
        },
      },
    },
    {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
        },
      },
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream',
        },
      },
    },
    {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'file-loader',
      },
    },
    {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'image/svg+xml',
        },
      },
    },
    {
      test: /\.css$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }],
    }],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'root.jQuery': 'jquery',
    }),
  ],
};

if (TARGET === 'build') {
  /**
   * @type {import('webpack').Configuration}
   */
  const buildConfig = {
    entry: ['./app/main'],
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
    ],
    optimization: {
      minimize: true,
    },
  };

  module.exports = merge(common, buildConfig);
}

const proxy = [
  '/',
  '/api/*',
  '/auth/*',
  '/favicon.ico',
  '/help',
  '/img/*',
  '/layout/*',
  '/location/*',
  '/locations/*',
  '/login',
  '/metrics/*',
  '/plant/*',
  '/plants/*',
  '/privacy',
  '/terms',
];

/**
 * @type {import('webpack-dev-server').ProxyConfigMap}
 */
const passthrough = proxy.reduce(
  /**
   * @param {import('webpack-dev-server').ProxyConfigMap} acc - accumulator
   * @param {string} url
   */
  (acc, url) => {
  /**
   * @type {import('http-proxy-middleware').Config}
   */
    const proxyConfig = {
      target: 'http://localhost:3001/',
      secure: false,
      autoRewrite: true,
    };
    acc[url] = proxyConfig;
    return acc;
  }, {});

if (TARGET === 'dev') {
  /**
   * @type {import('webpack').Configuration}
   */
  const devConfig = {
    mode: 'development',
    devServer: {
      proxy: passthrough,
      contentBase: path.resolve(ROOT_PATH, 'build'),
    },
    entry: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:9090',
      'webpack/hot/only-dev-server',
      './app/main',
    ],
    devtool: 'cheap-module-source-map',
  };
  module.exports = merge(common, devConfig);
}

/* eslint-enable security/detect-unsafe-regex */
