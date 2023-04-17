const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
    },
    target: 'node',
    externals: [nodeExternals({
        allowlist: ['socket.io']
    })],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        alias: {
            '@config': path.resolve(__dirname, 'config'),
            '@routes': path.resolve(__dirname, 'routes'),
            '@controllers': path.resolve(__dirname, 'controllers'),
            '@services': path.resolve(__dirname, 'services'),
            '@validators': path.resolve(__dirname, 'validators'),
            '@models': path.resolve(__dirname, 'models'),
            '@middlewares': path.resolve(__dirname, 'middlewares'),
            '@helpers': path.resolve(__dirname, 'helpers'),
        },
    },
};