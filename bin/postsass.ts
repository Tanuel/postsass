#!/usr/bin/env node
/*
 * Build tool to compile scss to css via dart-sass and postcss
 */

import { compile, Params } from "../index";

import yargs from "yargs";

/**
 *  The Command Chain
 *  First up is the builder
 */
const chain = yargs.command(
  ["*"],
  "Compiler",
  (yargs) => {
    yargs
      .usage(
        [
          "$0 --dir src[:dist]",
          "[--watch]",
          "[--context .]",
          "[--outputStyle expanded|compressed]",
          "[--sourceMap (false)]",
        ].join("\n    ")
      )
      .option("outputStyle", {
        alias: ["style", "s"],
        type: "string",
        description: "Similar to the sass option",
        default: "expanded",
        choices: ["compressed", "expanded"],
      })
      .option("dir", {
        alias: "d",
        description: "Pass a set of input directories to compile, like '--dir src' or '--dir src:dist' ",
        demandOption: true,
        type: "array",
      })
      .option("sourceMap", {
        type: "boolean",
        description: "write source maps",
        default: true,
      })
      .option("context", {
        type: "string",
        description: "The directory where to look for the passed sources. Defaults to process.cwd()",
        default: process.cwd(),
      })
      .option("watch", {
        type: "boolean",
        description: "Enable watch mode to recompile on changes",
        default: false,
      })
      .option("debug", {
        type: "boolean",
        description: "Log additional debug info to process.cwd()/_postsassDebug",
        default: false,
      });
  },
  // If we don't exit the process here, the terminal gets stuck where the arrow keys print ^[[A,^[[B etc...
  // If you know how to fix this, feel free.
  (params: Params) => compile(params).then(() => process.exit())
);

/**
 * Clean previously processed files
 * TODO: Implement. Have to decide wether to track written files somewhere or calculate them on the fly.
 * could also use `build --dir src:out --clean` instead, similar to what TypeScript does 🤔🤔🤔🤔🤔🤔🤔🤔:thinking:
 */
chain.command(
  "clean",
  "Clean output",
  () => {},
  (argv) => {
    console.warn("Not implemented yet");
  }
);

chain.argv;
