'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const { emptyDir, readFileSync, writeFileSync } = require('fs-extra')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const SWRegisterWebpackPlugin = require('sw-register-webpack-plugin')
const { InjectManifest } = require('workbox-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = require('../config/prod.env')

emptyDir(config.build.assetsRoot);

function useWorkbox(webpackConfig, workboxConfig) {
  let {
    swSrc,
    swDest,
    disableGenerateNavigationRoute = false,
  } = workboxConfig;
  
  let workboxInjectManifestConfig = {
    importWorkboxFrom: 'disabled',
    exclude: [
      /\.map$/,
      /^manifest.*\.js(?:on)?$/,
      /\.hot-update\.js$/,
      /sw-register\.js/
    ]
  };
  // swDest must be a relative path in workbox 3.x
  swDest = path.basename(swDest);
  workboxConfig = Object.assign({}, workboxConfig, workboxInjectManifestConfig, { swDest });

  let serviceWorkerContent = readFileSync(swSrc);

  let { version: workboxBuildVersion} = require('workbox-build/package.json');

  const importWorkboxClause = `
    importScripts('${config.build.assetsPublicPath}static/workbox-v${workboxBuildVersion}/workbox-sw.js');
    workbox.setConfig({
      modulePathPrefix: '${config.build.assetsPublicPath}static/workbox-v${workboxBuildVersion}/'
    });`;
  serviceWorkerContent = importWorkboxClause + serviceWorkerContent;

  if (!disableGenerateNavigationRoute) {
    const registerNavigationClause = `workbox.routing.registerNavigationRoute('${config.build.assetsPublicPath}index.html')`;
    // precache inject point
    const WORKBOX_PRECACHE_REG = /workbox\.precaching\.precacheAndRoute\(self\.__precacheManifest\);/;
    if (WORKBOX_PRECACHE_REG.test(serviceWorkerContent)) {
      serviceWorkerContent = serviceWorkerContent.replace(WORKBOX_PRECACHE_REG,
        `workbox.precaching.precacheAndRoute(self.__precacheManifest);\n${registerNavigationClause}\n`);
    } else {
      serviceWorkerContent += registerNavigationClause;
    }
  }

  const tempSwSrc = path.join('./build', 'sw-temp.js');
  writeFileSync(tempSwSrc, serviceWorkerContent, 'utf8');
  workboxConfig.swSrc = tempSwSrc;

  delete workboxConfig.enabled;
  delete workboxConfig.disableGenerateNavigationRoute;

  webpackConfig.plugins.push(
    new InjectManifest(workboxConfig)
  );
}

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash:8].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash:8].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash:8].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
  ]
})

if (config.build.serviceWorker.enabled !== false) {
  useWorkbox(webpackConfig, config.build.serviceWorker);
  webpackConfig.plugins.push(new SWRegisterWebpackPlugin({
    filePath: path.resolve(__dirname, 'sw-register.js'),
    prefix: config.build.assetsPublicPath
  }))
}

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
