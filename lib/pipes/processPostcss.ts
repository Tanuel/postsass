import sass from "sass";
import postcss from "postcss";
import { EntryConfig } from "../../index";

export interface PostcssPipeResult {
  result: postcss.Result;
  sassResult: sass.Result;
  from: string;
  to: string;
}

/**
 * Process a single sass Result and return an object
 * including the postcss result and the previous sass result
 * @param sassResult
 * @param entry
 */
export async function processPostcss(sassResult: sass.Result, entry: EntryConfig): Promise<PostcssPipeResult> {
  const from = sassResult.stats.entry;
  const to = from.replace(entry.src, entry.out).replace(/\.scss$/, ".css");
  const options: postcss.ProcessOptions = {
    from,
    to,
  };

  if (sassResult.map) {
    options.map = {
      prev: sassResult.map.toString(),
      inline: false,
    };
  }

  const result = await postcss(entry.postcssConfig.postcss?.plugins ?? []).process(sassResult.css, options);

  return {
    result,
    sassResult,
    from,
    to,
  };
}
