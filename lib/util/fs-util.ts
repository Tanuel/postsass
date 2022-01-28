import { promises as fs } from "fs";
import * as path from "path";

/**
 * Write a file to the specified path
 * If the directory does not exist, it will be created
 */
export async function writeFile(filepath: string, data: any) {
  const dir = path.dirname(filepath);
  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      await fs.mkdir(dir, { recursive: true });
    }
  } catch(e: any) {
    if (e.code === "ENOENT") {
      await fs.mkdir(dir, { recursive: true });
    } else {
      throw e;
    }
  }
  return fs.writeFile(filepath, data);
}
