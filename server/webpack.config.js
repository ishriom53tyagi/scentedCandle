const path = require('path')
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    entry: {
        app: "./app.js",
        scheduler: "./scheduler.js",
        main: "./child-process/main.js"
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    },
    target: 'node',
    externals: [nodeExternals(), {
        './config.json': 'require("./config")',
        '../config.json': 'require("./config")',
        './config': 'require("./config")',
        '../config': 'require("./config")',
    }],
    optimization: {
        minimize: false
    }
}