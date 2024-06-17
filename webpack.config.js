const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/login.html',
            filename: 'login.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/signup.html',
            filename: 'signup.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/profile.html',
            filename: 'profile.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/rankingsetup.html',
            filename: 'rankingsetup.html'
        })
    ],
    mode: 'development'
};
