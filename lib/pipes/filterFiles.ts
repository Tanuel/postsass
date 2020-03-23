import through2 from "through2";
import * as path from "path";

/**
 * Only includes files with the .scss extension
 * but excludes partials, starting with _
 */
export function filterFiles() {
  return through2.obj(async function (item, enc, next) {
    // include all scss files
    const isScss = path.extname(item.path) === ".scss";
    const isSass = path.extname(item.path) === ".sass";
    // exclude partials (starting with _)
    const isPartial = path.basename(item.path).startsWith("_");
    // exclude directories
    if (!item.stats.isDirectory() && !isPartial && (isScss || isSass)) {
      this.push(item);
    }
    next();
  });
}
