module.exports = {
  style: {
    postcss: {
      mode: 'extends',
      loaderOptions: {
        sourceMap: false,
      },
    },
  },
  webpack: {
    configure: {
      optimization: {
        splitChunks: {
          chunks: 'all',
        },
      },
    },
  },
} 