import { find, floor, range } from "lodash";
import { parseMap } from "./parseMap";

export function getDefaults(
  m: string = "",
  vert: string = "v",
  edge: string = "e"
) {
  return {
    start: 0,
    end: 0,
  };
}
