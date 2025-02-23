import { dump } from "js-yaml";
import { Controller } from "./types";
import { inferLayerName } from "layers";

export const getSources = ((layer) => {
  const trace = layer?.source?.trace;
  return [
    {
      id: "trace",
      name: `${trace?.name ?? inferLayerName(layer) ?? "Untitled trace"}`,
      language: "yaml",
      content: trace?.content
        ? dump(trace.content, { noCompatMode: true })
        : "",
    },
  ];
}) satisfies Controller["getSources"];
