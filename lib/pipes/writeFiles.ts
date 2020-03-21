import { PostcssPipeResult } from "./processPostcss";
import * as path from "path";
import { EntryConfig } from "../../index";
import { writeFile } from "../util/fs-util";

/**
 * Get output filepaths for the css and map file
 */
function getOut(src: string, out: string, file: string) {
  const outfile = file.replace(src, out);
  const parsed = path.parse(outfile);
  return {
    css: path.format({ ...parsed, ext: ".css", base: undefined }),
    map: path.format({ ...parsed, ext: ".css.map", base: undefined }),
  };
}

/**
 * Write the Postcss result to the destination
 */
export async function writeResult(i: PostcssPipeResult, entry: EntryConfig) {
  const { src, out } = entry;
  const { css, map } = getOut(src, out, i.from);
  await writeFile(css, i.result.css);
  if (i.result.map) {
    await writeFile(map, i.result.map);
  }
  return i;
}
