const path = require('path');

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
    ],
    plugins: [
        [
            'module-resolver',
            {
                alias: {
                    '@config': path.resolve(__dirname, 'config'),
                    '@routes': path.resolve(__dirname, 'routes'),
                    '@controllers': path.resolve(__dirname, 'controllers'),
                    '@services': path.resolve(__dirname, 'services'),
                    '@validators': path.resolve(__dirname, 'validators'),
                    '@models': path.resolve(__dirname, 'models'),
                    '@middlewares': path.resolve(__dirname, 'middlewares'),
                    '@helpers': path.resolve(__dirname, 'helpers'),
                }
            }
        ]
    ]
};