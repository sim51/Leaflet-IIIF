const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "none",
  entry: {
    "leaflet-iiif": ["./src/index.ts", "./src/assets/index.scss"],
    "leaflet-iiif.min": "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "./lib/umd"),
    filename: "[name].js",
    library: "leaflet-iiif",
    libraryTarget: "umd",
    globalObject: "this",
  },
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../[name].css",
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
      }),
    ],
  },
  stats: {
    errorDetails: true,
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
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
