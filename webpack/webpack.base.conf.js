var path = require('path')
var utils = require('./utils')
var config = require('./config')
var vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}


var uniqueStr = Date.now().toString(36)

module.exports = {
  watchOptions:{
    poll: 1000
  },
  entry: {
    app: ['./src/main.js']
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
          publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      // {
      //   test: /\.svg$/,
      //   loader: 'vue-svg-loader',
      //   options: {
      //     // optional [svgo](https://github.com/svg/svgo) options
      //     svgo: {
      //       plugins: [
      //         {removeDoctype: false},
      //         {removeComments: false}
      //       ]
      //     }
      //   }
      // },
      {
        test: /\.svgc$/,
        loader  : [
          {
            loader:`${require.resolve('shadow-icons/webpack/shadow-svg-js-loader.js')}`,
            query:{uniqueStr:uniqueStr}
          },
          "style-loader",
          "css-loader",
          {
            loader:`${require.resolve('shadow-icons/webpack/shadow-svg-css-loader.js')}`,
            query:{uniqueStr:uniqueStr}
          },
        ]
      }
    ]
  }
}
