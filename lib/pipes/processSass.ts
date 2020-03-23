import sass from "sass";
import { EntryConfig } from "../../index";

/**
 * Process a single sass file and return the full Result
 * @param inPath
 * @param entry
 */
export async function processSass(inPath: string, entry: EntryConfig): Promise<sass.Result> {
  const outFile = inPath.replace(entry.src, entry.out).replace(/\.(scss|sass)$/, ".css");
  return sass.renderSync({
    ...entry.postsassConfig.sass,
    file: inPath,
    outFile,
  });
}
