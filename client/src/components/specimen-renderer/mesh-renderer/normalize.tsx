import { maxBy, minBy } from "lodash";
import { Trace } from "protocol/Trace";
import { MapInfo } from "../map-parser/MapInfo";
import { Point } from "../Renderer";
import { Scale } from "../Scale";
import { Nodes } from "./parse";

const { max, log10 } = Math;

const mag = (n: number) => 10 ** ~~log10(n);

const keys = ["x", "y"] as const;

const pairs = [
  ["cx", "cy"],
  ["x1", "y1"],
  ["x2", "y2"],
] as const;

export function normalize(m: MapInfo<Nodes>, specimen?: Trace) {
  const verts = [...m.nodes.edges, ...(specimen?.eventList ?? [])].flatMap(
    ({ variables }) =>
      pairs.map(([x, y]) => ({
        x: variables?.[x],
        y: variables?.[y],
      }))
  );

  const [[minX, minY], [maxX, maxY]] = [minBy, maxBy].map((f) =>
    keys.map((k) => f(verts, k)?.[k] ?? 0)
  );

  const [width, height] = [maxX - minX, maxY - minY];

  const scale = 20 / mag(max(width, height));

  const to = ({ x, y }: Point) => ({
    x: (x - minX) * scale,
    y: (y - minY) * scale,
  });

  const from = ({ x, y }: Point) => ({
    x: x / scale + minX,
    y: y / scale + minY,
  });

  return {
    to,
    from,
    scale,
    width,
    height,
    minX,
    maxX,
    minY,
    maxY,
  } as Scale<Point>;
}
