module.exports = function ({ env }) {
  return {
    webpack: {
      configure: {
        module: {
          rules: [
            {
              test: /\.worker\.(c|m)?js$/i,
              loader: 'worker-loader',
              options: { filename: '[name].[contenthash].js' },
            },
          ],
        },
      },
    },
  }
}
