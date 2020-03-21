import { processSass } from "./pipes/processSass";
import { PostcssPipeResult, processPostcss } from "./pipes/processPostcss";
import { writeResult } from "./pipes/writeFiles";
import { EntryConfig } from "../index";
import through2 from "through2";
import chalk from "chalk";
import { addError } from "./util/error-collector";

export function compilerPipe(entry: EntryConfig) {
  return through2.obj(async function(item, enc, next) {
    const inPath = item.path;
    try {
      const result = await compileFile(inPath, entry);
      this.push(result);
    } catch (e) {
      console.error(chalk.red("Error in", item.path));
      addError(e);
    }
    next();
  });
}

export async function compileFile(p: string, entry: EntryConfig): Promise<PostcssPipeResult> {
  const sass = await processSass(p, entry);
  const pcr = await processPostcss(sass, entry);
  const write = await writeResult(pcr, entry);
  return write;
}
