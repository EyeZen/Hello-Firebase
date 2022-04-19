# webpack setup
- npm i -D webpack webpack-cli html-webpack-plugin html-loader
- npm i -D webpack-dev-server [optional]
- npm i -D @babel/core babel-loader @babel/preset-env
- npm i -D file-loader
- md src
- touch src/index.js src/index.html
- touch webpack.config.js

# why?
- **webpack** bundles all js files into single file
- **html-webpack-plugin** automatically generates and links bundled js files to html
- **html-loader** processes scripts loaded in html files into browser runnable files
- **webpack-dev-server** local server and auto refresh
- **babel**  converts es6 code to browser-runnable code
- **file-loader** makes it possible to load assets in the auto generated file from the 
**OR**
-- prevents src/.html assets from breaking

- webpack compiles src/*.js files to dest/main.js

const HtmlWebPackPlugin = require('html-webpack-plugin')
// for sass
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    module: {
        rules: [
            { // babel rule
                test: /\.js/,
                exclude: /node_modules/,
                use: [
                    {   // files being loaded first processed by loaders
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                // regex, finds all html files
                test: /\.html$/,
                use: [
                    {   // files being loaded first processed by loaders
                        loader: "html-loader",
                        options: { minimize: true }
                    }
                ]
            },
            {   process and forward refs. to assets from original to bundled
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                use: [
                    "file-loader"
                ]
            },
            {
                test: /\.scss/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            // takes the src/index.html
            template: "./src/index.html",
            // transpiles into root/index.html
            filename: "./index.html"
        }),
        // for sass
        new MiniCssExtractPlugin(
            // Options similar to the same options in webpackOptions.output
            // oth options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        )
    ]
}

## Installs for Sass (scss)
- npm i -D node-sass style-loader css-loader sass-loader mini-css-extract-plugin