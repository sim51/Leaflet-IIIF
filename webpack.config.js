const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let production = process.argv.indexOf("--mode");
production = production !== -1 ? process.argv[production + 1] === "production" : false;

module.exports = {
  mode: production ? "production" : "none",
  entry: {
    index: [path.resolve(__dirname, "./dist/esm/index.js"), path.resolve(__dirname, "./src/assets/index.scss")],
  },
  output: {
    path: path.resolve(__dirname, "./dist/umd"),
    filename: production ? "[name].min.js" : "[name].js",
    library: "leaflet-iiif",
    libraryTarget: "umd",
    globalObject: "this",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../[name].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        loader: "svg-url-loader",
        options: {
          noquotes: true,
        },
      },
    ],
  },
  externals: {
    leaflet: { amd: "leaflet", root: "L", commonjs: "leaflet", commonjs2: "leaflet" },
  },
  devServer: {
    contentBase: "./",
    writeToDisk: true,
  },
};
