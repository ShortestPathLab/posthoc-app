import { dump } from "js-yaml";
import { editor } from "./editor";
import { Controller } from "./types";

export const getSources = ((layer) => {
  const trace = layer?.source?.trace;
  return trace
    ? [
        {
          id: "trace",
          name: `${trace.name}`,
          language: "yaml",
          content: dump(trace.content, { noCompatMode: true }),
          editor,
        },
      ]
    : [];
}) satisfies Controller["getSources"];
