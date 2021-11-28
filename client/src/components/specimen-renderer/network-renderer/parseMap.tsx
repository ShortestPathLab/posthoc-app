import { Point } from "components/specimen-renderer/Renderer";
import { floor, max, maxBy, minBy, split } from "lodash";
import { TraceEvent } from "protocol/Trace";

enum Index {
  X,
  Y,
}

const mag = (n: number) => 10 ** Math.log10(n);

export function parseMap(
  m: string = "",
  vert: string = "v",
  edge: string = "e"
) {
  const lines = split(m, "\n");
  const verts = lines
    .filter((c) => c.startsWith(vert))
    .map((c: string) => {
      const [, , x, y] = split(c, " ");
      return [+x, +y] as [number, number];
    });
  const edges = lines
    .filter((c) => c.startsWith(edge))
    .map((c: string) => {
      const [, a, b] = split(c, " ");
      return [+a, +b] as [number, number];
    });
  const [[minX, minY], [maxX, maxY]] = [minAt, maxAt].map((f) =>
    [Index.X, Index.Y].map((i) => f(verts, i) ?? 0)
  );
  const [width, height] = [maxX - minX, maxY - minY];
  const scale = 100 / mag(max([width, height]) ?? 0);
  return [
    { x: width * scale, y: height * scale },
    edges.map(([a, b]) => {
      const [[x1, y1], [x2, y2]] = [verts[a], verts[b]];
      return {
        variables: {
          x1: (x1 - minX) * scale,
          y1: (y1 - minY) * scale,
          x2: (x2 - minX) * scale,
          y2: (y2 - minY) * scale,
        },
      };
    }) as TraceEvent[],
    ({ x, y }: Point) => false,
  ] as const;
}

const minAt = (c: number[][], index: number) => minBy(c, index)?.[index];
const maxAt = (c: number[][], index: number) => maxBy(c, index)?.[index];
