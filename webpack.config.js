const path = require("path");

let production = process.argv.indexOf("--mode");
production = production !== -1 ? process.argv[production + 1] === "production" : false;

module.exports = {
  name: "leaflet-iiif",
  mode: production ? "production" : "none",
  devtool: "source-map",
  entry: "./src/index.ts",
  output: {
    filename: production ? "leaflet-iiif.min.js" : "leaflet-iiif.js",
    path: path.join(__dirname, "build"),
    library: "leaflet-iiif",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["src", "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
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
    L: "leaflet",
  },
  devServer: {
    contentBase: "./",
    writeToDisk: true,
  },
};
