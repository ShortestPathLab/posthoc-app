import { dump } from "js-yaml";
import { Controller } from "./types";

export const getSources = ((layer) => {
  const trace = layer?.source?.trace;
  return trace
    ? [
        {
          id: "trace",
          name: `${trace.name ?? "Untitled trace"}`,
          language: "yaml",
          content: dump(trace.content, { noCompatMode: true }),
        },
      ]
    : [];
}) satisfies Controller["getSources"];
