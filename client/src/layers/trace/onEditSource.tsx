import { nanoid } from "nanoid";
import { parseYamlAsync } from "workers/async";
import { Trace } from "protocol/Trace-v140";
import { set } from "utils/set";
import { Controller } from "./types";

export const onEditSource = (async (layer, id, content) => {
  try {
    if (id !== "trace") throw { error: "id not trace", id };
    if (!content) throw { error: "content is undefined", layer, content };

    const { result, error } = await parseYamlAsync(content);
    if (error) return { error };
    // Set the trace content
    set(layer, "source.trace.content", result as Trace | undefined);
    // To get things to change, we also need to change the trace key
    set(layer, "source.trace.key", nanoid());
  } catch (error) {
    console.error(error);
  }
  return { result: layer };
}) satisfies Controller["onEditSource"];
