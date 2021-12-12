import { Dictionary, maxBy, minBy, findIndex } from "lodash";
import { makeMapParser } from "../Parser";
import { Point } from "../Renderer";
import { Structure } from "./Structure";

const { sqrt } = Math;

const dist = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) =>
  sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

const minAt = (c: Dictionary<number>[], index: string) =>
  minBy(c, index)?.[index];

const maxAt = (c: Dictionary<number>[], index: string) =>
  maxBy(c, index)?.[index];

function aabb(verts: Point[]) {
  const [[minX, minY], [maxX, maxY]] = [minAt, maxAt].map((f) =>
    ["x", "y"].map((i) => f(verts, i) ?? 0)
  );
  const [width, height] = [maxX - minX, maxY - minY];
  return { width, height, minX, minY, maxX, maxY };
}

type Options = {
  vert?: string;
  edge?: string;
};

export const parse = makeMapParser<Options, Structure>(
  (m, { vert = "v", edge = "e" }: Options) => {
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

    return {
      bounds: aabb(verts),
      nodes: {
        verts: verts.map((point) => ({
          variables: point,
        })),
        edges: edges.map(({ a, b }) => {
          const { x: x1, y: y1 } = verts[a];
          const { x: x2, y: y2 } = verts[b];
          return { variables: { x1, y1, x2, y2 } };
        }),
      },
      snap: (point, scale = 1) => {
        const a = point;
        const vert = minBy(verts, (b) => dist(a, b));
        if (vert && dist(vert, a) < 1.5 / scale) return vert;
      },
      nodeAt: (p) => {
        const i = findIndex(verts, p);
        return i !== -1 ? i : undefined;
      },
      pointOf: (node) => verts[node],
    };
  }
);
