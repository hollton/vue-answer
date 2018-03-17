var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var webpack = require('webpack')

/*把配置注入到全局变量window.__config*/
var fs = require('fs');
var appENV = require('../src/config/' + (process.env.npm_config_env || 'development'));
// 启动页面中有占位符<script id="inject_config">xxxx</script>
var indexFile = path.join(__dirname, '..', 'index.html');
var content = fs.readFileSync(indexFile, 'utf-8');
content = content.replace(/<script id="inject_config">.*?<\/script>/, '<script id="inject_config">var __config = ' + JSON.stringify(appENV) + ';</script>');
fs.writeFileSync(indexFile, content);

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        Hunter: ['eventsource-polyfill', 'babel-polyfill','./src/main.js']
    },
    output: {
        library: '[name]',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: config.build.assetsRoot,
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
    },
    externals: {
        '__config': '__config'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': resolve('src')
        }
    },
    module: {
        rules: [{
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            enforce: 'pre',
            include: [resolve('src'), resolve('test')],
            options: {
                formatter: require('eslint-friendly-formatter')
            }
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: vueLoaderConfig
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [resolve('src'), resolve('test')]
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: utils.assetsPath('img/[name].[hash:7].[ext]')
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
            }
        }]
    }
}
