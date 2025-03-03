import { pick } from "lodash-es";
import { Controller } from "./types";

export const compress = ((layer) =>
  pick(layer, [
    "trace",
    "onion",
    "step",
    "code",
    "breakpoints",
  ])) satisfies Controller["compress"];
