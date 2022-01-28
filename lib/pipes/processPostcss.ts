import sass from "sass";
import postcss, { AcceptedPlugin, Result as PostcssResult, ProcessOptions as PostcssProcessOptions } from "postcss";
import { EntryConfig } from "../../index";

export interface PostcssPipeResult {
  result: PostcssResult;
  sassResult: sass.LegacyResult;
  from: string;
  to: string;
}

export interface PostcssUseParams {
  from: string;
  to: string;
}

type PostcssUse = (p: PostcssUseParams) => AcceptedPlugin;

/**
 * Process a single sass Result and return an object
 * including the postcss result and the previous sass result
 * @param sassResult
 * @param entry
 */
export async function processPostcss(sassResult: sass.LegacyResult, entry: EntryConfig): Promise<PostcssPipeResult> {
  const from = sassResult.stats.entry;
  const to = from.replace(entry.src, entry.out).replace(/\.(scss|sass)$/, ".css");
  const options: PostcssProcessOptions = {
    from,
    to,
  };

  if (sassResult.map) {
    options.map = {
      prev: sassResult.map.toString(),
      inline: false,
    };
  }

  const conf = entry.postsassConfig.postcss;
  let processor = postcss(conf?.plugins ?? []);

  if (Array.isArray(conf?.use)) {
    const useParams: PostcssUseParams = {
      from,
      to,
    };
    conf.use.forEach((u: PostcssUse | AcceptedPlugin) => {
      if (typeof u === "function") {
        processor = processor.use((u as PostcssUse)(useParams));
      } else {
        processor = processor.use(u);
      }
    });
  }

  const result = await processor.process(sassResult.css, options);

  return {
    result,
    sassResult,
    from,
    to,
  };
}
