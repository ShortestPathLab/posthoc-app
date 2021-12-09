import { Transform } from "../Transform";
import { MapInfo } from "../map-parser/MapInfo";
import { Point } from "../Renderer";

export function transformer(m: MapInfo) {
  return {
    to: ({ x, y }: Point) => ({ x: x + 0.5, y: y + 0.5 }),
    from: ({ x, y }: Point) => ({ x: x - 0.5, y: y - 0.5 }),
    scale: 1,
    ...m.bounds,
  } as Transform<Point>;
}
