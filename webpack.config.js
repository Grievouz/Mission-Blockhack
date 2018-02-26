const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/index.tsx",
    node: {
        fs: "empty"
    },
    output: {
        filename: "js/bundle.js",
        path: path.resolve(__dirname, "public")
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },

            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" }
                ]
            },

            {
                enforce: "pre",
                test: /\.js$/, loader: "source-map-loader"
            },

            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin("css/bundle.css")
    ],

    devServer: {
        contentBase: path.resolve(__dirname, "public"),
        inline: true,
        compress: true,
        hot: true,
        port: 9000
    },

};