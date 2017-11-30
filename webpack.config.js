const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const { TARGET } = process.env;
const ROOT_PATH = path.resolve(__dirname);

/* eslint-disable security/detect-unsafe-regex */

const common = {
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    // publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {},
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
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
    },
    {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
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
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
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

function addVendor(vendorName, moduleLocation) {
  common.resolve.alias[vendorName] = path.join(__dirname, moduleLocation);
}

addVendor('jquery', 'node_modules/jquery/dist/jquery.js');
addVendor('bootstrap', 'node_modules/bootstrap/dist/js/bootstrap.js');
addVendor('konva', 'node_modules/konva/konva.js');
addVendor('bootstrap.css', 'node_modules/bootstrap/dist/css/bootstrap.css');

if (TARGET === 'build') {
  module.exports = merge(common, {
    entry: ['./app/main'],
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ],
  });
}

const proxy = [
  '/',
  '/api/*',
  '/auth/*',
  '/favicon.ico',
  '/help',
  '/img/*',
  '/layout/*',
  '/login',
  '/plant/*',
  '/plants/*',
  '/privacy',
  '/terms',
];

const passthrough = proxy.reduce((acc, url) => {
  acc[url] = {
    target: 'http://localhost:3001/',
    secure: false,
    autoRewrite: true,
  };

  return acc;
}, {});

if (TARGET === 'dev') {
  module.exports = merge(common, {
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
  });
}

/* eslint-enable security/detect-unsafe-regex */
