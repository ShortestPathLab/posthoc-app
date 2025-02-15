import { Controller } from "./types";

export const inferName = ((layer) =>
  layer.source?.trace?.name ??
  "Untitled Trace") satisfies Controller["inferName"];
