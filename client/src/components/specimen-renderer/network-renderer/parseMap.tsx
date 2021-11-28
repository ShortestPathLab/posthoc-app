import { Point } from "components/specimen-renderer/Renderer";
import {
  filter,
  flatMap as flat,
  last,
  map,
  maxBy,
  minBy,
  split,
} from "lodash";
import { TraceEvent } from "protocol/Trace";

export function parseMap(
  m: string = "",
  vert: string = "v",
  edge: string = "e"
) {
  const lines = split(m, "\n");
  const [verts, edges] = [vert, edge].map((d) =>
    filter(lines, (c) => c.startsWith(d)).map(extract)
  );
  const [width, height] = [0, 1].map((i) => maxAt(verts, i) ?? 0);
  return [
    { x: width, y: height },
    edges.map(([a, b]) => {
      const [[x1, y1], [x2, y2]] = [verts[a], verts[b]];
      return { variables: { x1, y1, x2, y2 } };
    }) as TraceEvent[],
    ({ x, y }: Point) => false,
  ] as const;
}

const maxAt = (c: number[][], index: number) => maxBy(c, index)?.[index];

const extract = (c: string) => {
  const [, , x, y] = split(c, " ");
  return [+x, +y] as [number, number];
};
