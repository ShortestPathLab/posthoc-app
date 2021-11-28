import { find, floor, range } from "lodash";
import { parseMap } from "./parseMap";

export function getDefaults(
  m: string = "",
  vert: string = "v",
  edge: string = "e"
) {
  const [{ x: w, y: h }, , valid] = parseMap(m, vert, edge);
  const node =
    find(range(w * h), (i) => valid({ x: i % w, y: floor(i / w) })) ?? 0;
  return {
    start: node,
    end: node,
  };
}
