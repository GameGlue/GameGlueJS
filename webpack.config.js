const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: './gg.sdk.js',
    path: path.resolve(__dirname, 'dist'),
  },
};