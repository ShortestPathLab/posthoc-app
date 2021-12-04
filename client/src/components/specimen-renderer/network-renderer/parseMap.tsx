import { Dictionary, maxBy, minBy } from "lodash";
import { makeMapParser } from "../MapParser";
import { Point } from "../Renderer";

const { log, max, sqrt } = Math;

const dist = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) =>
  sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

const mag = (n: number) => 10 ** Math.log10(n);

const minAt = (c: Dictionary<number>[], index: string) =>
  minBy(c, index)?.[index];

const maxAt = (c: Dictionary<number>[], index: string) =>
  maxBy(c, index)?.[index];

function bounds(verts: Point[]) {
  const [[minX, minY], [maxX, maxY]] = [minAt, maxAt].map((f) =>
    ["x", "y"].map((i) => f(verts, i) ?? 0)
  );
  const [width, height] = [maxX - minX, maxY - minY];
  return { width, height, minX, minY, maxX, maxY };
}

function parse(m: string, vert: string, edge: string) {
  const lines = m.split("\n");
  // Parse vertices
  const verts = lines
    .filter((c) => c.startsWith(vert))
    .map((c: string) => {
      const [, , x, y] = c.split(" ");
      return { x: +x, y: +y };
    });
  // Parse edges
  const edges = lines
    .filter((c) => c.startsWith(edge))
    .map((c: string) => {
      const [, a, b] = c.split(" ");
      return { a: +a, b: +b };
    });
  return { verts, edges };
}

type Options = {
  vert?: string;
  edge?: string;
};

export const parseMap = makeMapParser(
  (m, { vert = "v", edge = "e" }: Options) => {
    const { verts, edges } = parse(m, vert, edge);
    const { width, height, minX, minY } = bounds(verts);
    const scale = (20 * log(edges.length + 1)) / mag(max(width, height));

    const to = ({ x, y }: Point) => ({
      x: (x - minX) * scale,
      y: (y - minY) * scale,
    });
    const from = ({ x, y }: Point) => ({
      x: x / scale + minX,
      y: y / scale + minY,
    });

    return {
      size: { x: width * scale, y: height * scale },
      nodes: {
        verts: verts.map((point) => ({
          variables: to(point),
        })),
        edges: edges.map(({ a, b }) => {
          const { x: x1, y: y1 } = to(verts[a]);
          const { x: x2, y: y2 } = to(verts[b]);
          return { variables: { x1, y1, x2, y2 } };
        }),
      },
      resolve: (point) => {
        const a = from(point);
        const vert = minBy(verts, (b) => dist(a, b));
        if (vert && dist(vert, a) < 2 / scale) return to(vert);
      },
      getNode: () => undefined,
      to,
      from,
    };
  }
);
