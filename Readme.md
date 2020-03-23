[![Powered by Tanuel](https://img.shields.io/badge/Powered%20by-Tanuel-b22.svg)](https://github.com/Tanuel)
[![Documentation](https://img.shields.io/badge/-Documentation-blueviolet.svg)](https://tanuel.gitlab.io/postsass)
[![npm](https://img.shields.io/npm/v/postsass.svg?logo=npm)](https://www.npmjs.com/package/postsass)
[![npm](https://img.shields.io/npm/dt/postsass.svg?logo=npm)](https://www.npmjs.com/package/postsass)

# PostSass - Sass x PostCSS cli compiler

PostSass is a cli tool to build scss files via [dart-sass](https://github.com/sass/dart-sass) and [PostCSS](https://github.com/postcss/postcss)

## Installation

Requirements:

- Node 12.x (Not tested for older versions)
- yarn or npm

Using yarn

    yarn add -D postsass

Using npm

    npm install postsass --save-dev

## Usage

PostSass will compile all `.sass` and `.scss` files to css, except partials starting with `_`,
according to sass spec.

### Basic

```bash
# compile files in the same directory
yarn postsass --dir src

# compile files from src to dist (keeping directory structure
yarn postsass --dir scss:css

#compile multiple directories
yarn postsass --dir scss:css --dir fonts
# -> write files from directory scss to css
# -> write files from directory fonts to fonts
```

## Cli options

| Option                               | Values                     | Description                                                                                                    |
| ------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--help`                             | -                          | Show overview of commands                                                                                      |
| `--version`                          | -                          | Show version                                                                                                   |
| `--dir`<br>`-d`                      | -                          | Read files from source and write them to the destination if specified<br> e.g. `--dir src` or `--dir src:dist` |
| `--outputStyle`<br>`--style`<br>`-s` | `compressed` or `expanded` | output [style](https://sass-lang.com/documentation/cli/dart-sass#style) according to dart sass                 |
| `--sourceMap`                        | `true` or `false`          | generate sourcemaps                                                                                            |
| `--context`                          | default: `process.cwd()`   | The working directory where to look for source files. Needs to be an absolute path                             |
| `--watch`                            | -                          | Enable watch mode                                                                                              |

## Configuration File and Postcss Plugins

You can provide a file named `postsass.config.js` to provide configuration and plugins for PostCSS

The file needs to be located in the working directory (`process.cwd()`)

### Example

```javascript
const path = require("path");
const autoprefixer = require("autoprefixer");
const oldie = require("oldie");
const postcssUrl = require("postcss-url");

module.exports = {
  sass: {
    includePaths: [path.dirname(require.resolve("modern-normalize"))],
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
```

### Why not postcss.config.js?

We do not want to conflict with other configuration files. This would give us limitations
and we would have to be aware of compatibility issues. Postsass is not intended to be used
along postcss-cli or webpack or any other compiler tools, but is aimed to work standalone for
those who don't use a bundler
