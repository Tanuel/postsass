import * as path from "path";
import chalk from "chalk";
import klaw from "klaw";
import { filterFiles } from "./lib/pipes/filterFiles";
import { PostcssPipeResult } from "./lib/pipes/processPostcss";
import { getErrorCollector } from "./lib/util/error-collector";
import { compileFile, compilerPipe } from "./lib/compilerPipe";

type OutputStyle = "compressed" | "expanded";

/**
 * The paramets to pass in from the command
 */
export interface Params {
  context: string;
  dir: string[];
  outputStyle: OutputStyle;
  sourceMap: boolean;
  watch: boolean;
}

/**
 * The configuration for a single entry
 */
export interface EntryConfig {
  srcRelative: string;
  outRelative: string;
  src: string;
  out: string;
  sourceMap: boolean;
  outputStyle: OutputStyle;
  postcssConfig: any;
}

// A map of which file is a dependency of another file
const relationships: { [key: string]: string[] } = {};

let postcssConfig = {};

/**
 * Compile scss files
 * @param params
 */
export async function compile(params: Params) {
  const { context, outputStyle, sourceMap, dir, watch } = params;
  console.info(chalk.blue.bold("Using output style"), chalk.green(outputStyle));
  console.info(chalk.blue.bold("Source Map"), chalk.green(sourceMap));

  try {
    postcssConfig = await import(path.resolve(process.cwd(), "postsass.config"));
  } catch (e) {
    console.warn("No postcss config file found");
  }

  // set global options
  const options = {
    sourceMap,
    outputStyle,
  };
  // create a configuration for each entry directory
  const entries: EntryConfig[] = dir.map(d => {
    // split at semicolon
    const split = d.split(":", 2);

    const src = split[0];
    // no output path specified = use src dir for output
    const out = split[1] ?? split[0];
    // create a configuration for the entry dir
    const conf: EntryConfig = {
      ...options,
      srcRelative: src,
      outRelative: out,
      src: path.resolve(context, src),
      out: path.resolve(context, out),
      postcssConfig,
    };
    return conf;
  });
  // create promises for each entry
  const cbs = entries.map(
    async entry =>
      new Promise((resolve, reject) => {
        const { srcRelative, outRelative, src } = entry;
        console.info(
          chalk.blue.bold("Source dir"),
          chalk.magenta(srcRelative),
          chalk.yellow(" => "),
          chalk.blue.bold("Output dir"),
          chalk.magenta(outRelative)
        );

        // Use klaw to recursively walk the directories
        klaw(src + "/")
          .pipe(filterFiles()) // ony use scss files
          .pipe(compilerPipe(entry)) // make a few transformations with postcss
          .on("data", dataListener(params, entry)) // need to process data to trigger the "end" event to resolve the promise
          .on("end", resolve); // resolve promise
      })
  );

  try {
    // Wait until all files are processed
    await Promise.all(cbs);
  } catch (e) {
    console.error(chalk.red(chalk.bold("Error occured:"), e.message));
    console.error(e.stack);
    process.exitCode = 1;
    return;
  }
  // Check if any errors occured while compiling the sass files
  const errors = getErrorCollector();
  if (errors.hasErrors()) {
    console.error(chalk.bold.red("Erorrs occured while compiling:"));
    errors.forEach(e => console.error(e.message));
    process.exitCode = 2;
    return;
  }

  console.info(chalk.bold.green("All files compiled successfully!"));
  // Are we done yet?
  if (watch) {
    await enableWatchMode(params, entries);
    console.info("Graceful Shutdown");
    process.exitCode = 0;
    return;
  }
}

/**
 * Show a bit of info what should
 */
function dataListener(params: Params, entry: EntryConfig) {
  return (d: PostcssPipeResult) => {
    console.info(
      chalk.bold(
        chalk.blue(d.from.replace(entry.src, entry.srcRelative)),
        chalk.yellow("=>"),
        chalk.blue(d.to.replace(entry.out, entry.outRelative))
      )
    );

    if (params.watch) {
      relationTracker(d);
    }
  };
}
// track the dependency relations between files
// when a file is changed, all its dependants should be updated
// includedFiles includes the entry file as well
function relationTracker(d: PostcssPipeResult) {
  d.sassResult.stats.includedFiles.forEach(f => {
    if (!(f in relationships)) {
      relationships[f] = [];
    } else if (relationships[f].indexOf(d.from) === -1) relationships[f].push(d.from);
  });
}

async function enableWatchMode(params: Params, entries: EntryConfig[]) {
  try {
    // Chokidar is a nice tool for watching directories for changes.
    const chokidar = await import("chokidar");
    console.info(chalk.bold.cyan("Starting Watch Mode"));

    // Start watcher for every source set
    const promises = entries.map(entry => {
      return new Promise((resolve, reject) => {
        // create a pattern to watch all scss files
        const watchPattern = path.resolve(params.context, entry.srcRelative, "**/*.scss");
        const watcher = chokidar.watch(watchPattern);
        watcher
          // Show a little info when the watcher is ready to roll
          .on("ready", () =>
            console.info(chalk.bold(chalk.blue("Watching changes for"), chalk.magenta(entry.srcRelative)))
          )
          // Show a little info when a file has been removed
          .on("unlink", path => console.info(chalk.red(`File ${path} has been removed`)))
          // register the change handler
          .on("change", changeHandler(entry));
        process.on("SIGINT", () => {
          watcher.close().then(() => resolve());
        });
      });
    });
    return Promise.all(promises);
  } catch (e) {
    console.error(e);
    return;
  }
}

// The change listener for watchmode
function changeHandler(entry: EntryConfig) {
  return async (path: string) => {
    console.info(chalk.bold(chalk.blue("File changed:", chalk.magenta(path))));
    // Recompile all files that depend on the changed file
    if (path in relationships) {
      for (const p of Object.values(relationships[path])) {
        try {
          const write = await compileFile(p, entry);
          console.info(
            chalk.bold(chalk.blue("Updated file", chalk.magenta(write.from.replace(entry.src, entry.srcRelative))))
          );
        } catch (e) {
          console.error(chalk.bold.red("Error when compiling", p), e.message);
        }
      }
    }
  };
}
