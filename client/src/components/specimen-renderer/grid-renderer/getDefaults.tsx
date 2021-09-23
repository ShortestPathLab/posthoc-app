import { find, floor, range } from "lodash";
import { parseMap } from "./parseMap";

export function getDefaults(m: string = "", wall: string = "@") {
  const [{ x: w, y: h }, , valid] = parseMap(m, wall);
  const node =
    find(range(w * h), (i) => valid({ x: i % w, y: floor(i / w) })) ?? 0;
  return {
    start: node,
    end: node,
  };
}
