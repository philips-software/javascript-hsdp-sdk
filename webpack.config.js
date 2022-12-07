/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: './src/index.ts',
  output: {
    globalObject: 'this',
    filename: 'index.js',
    path: path.resolve('./dist'),
    library: 'JavascriptHsdp Sdk',
    libraryTarget: 'umd',
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [new NodePolyfillPlugin()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
