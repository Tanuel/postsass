import sass from "sass";
import { EntryConfig } from "../../index";

/**
 * Process a single sass file and return the full Result
 * @param inPath
 * @param entry
 */
export async function processSass(inPath: string, entry: EntryConfig): Promise<sass.Result> {
  const { sourceMap, outputStyle } = entry;
  const outFile = inPath.replace(entry.src, entry.out).replace(/\.scss$/, ".css");
  return sass.renderSync({
    file: inPath,
    outFile,
    sourceMap,
    outputStyle,
  });
}
