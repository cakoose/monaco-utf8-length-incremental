const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: "./src/index.ts",
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    globalObject: "self",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Monaco Editor Sample",
      template: "src/index.html",
    }),
    new MonacoEditorWebpackPlugin(),
  ]
};
