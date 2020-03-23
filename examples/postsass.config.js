const path = require("path");
const autoprefixer = require("autoprefixer");
const oldie = require("oldie");
const postcssUrl = require("postcss-url");
const tildeImporter = require("node-sass-tilde-importer");

module.exports = {
  sass: {
    // set includePaths for dependencies
    // includePaths: [path.dirname(require.resolve("modern-normalize"))],
    // use a sass importer
    importer: tildeImporter,
  },
  postcss: {
    plugins: [
      autoprefixer({ grid: "autoplace" }),
      oldie({
        rgba: {
          filter: true,
        },
      }),
    ],
    // when using the "use" property, you can pass callbacks to configure plugins at compile time
    // "from" gives you the source filename
    // "to" gives you the destination filename
    use: [
      // example: inline svg files, resolve relatively to file
      ({ from, to }) => postcssUrl({ filter: /\.svg$/, url: "inline", basePath: path.dirname(from) }),
    ],
  },
};
