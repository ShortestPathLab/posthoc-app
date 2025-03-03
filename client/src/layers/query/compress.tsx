import { pick } from "lodash-es";
import { Controller } from ".";

export const compress = ((layer) =>
  pick(layer, [
    "mapLayerKey",
    "query",
    "start",
    "end",
    "algorithm",
    "onion",
    "step",
    "code",
    "breakpoints",
  ])) satisfies Controller["compress"];
