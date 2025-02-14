import {
  chain,
  clamp,
  Dictionary,
  first,
  last,
  maxBy,
  mean,
  minBy,
  noop,
} from "lodash";
import pluralize from "pluralize";
import { Point } from "protocol";
import { ParsedMap } from "../Parser";
import { usingMessageHandler } from "workers/usingWorker";

export type Options = {
  color?: string;
  vert?: string;
  edge?: string;
};

export type ParseNetworkWorkerParameters = {
  map: string;
  options: Options;
};

export type ParseNetworkWorkerReturnType = Pick<
  ParsedMap,
  "log" | "bounds" | "nodes"
>;

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

function toSet<T>(v: Iterable<T>) {
  return new Set(v);
}

function getFromSet<T>(set?: Set<T>, f: (x: T) => any = noop) {
  if (set) {
    for (const a of set) {
      if (f(a)) return a;
    }
  }
}

function uniq<T extends any[]>(segments: T[]) {
  return [...new Map(segments.map((s) => [s.join(), s])).values()];
}

function optimizeNetworkEdges(segments: number[][]) {
  let xs = uniq(segments);
  // let xs = uniqBy(segments, join);

  while (true) {
    const byHead = chain(xs).groupBy(first).mapValues(toSet).value();
    const byTail = chain(xs).groupBy(last).mapValues(toSet).value();
    const merged: Set<number[]> = new Set();
    for (const x of xs) {
      if (!merged.has(x)) {
        const b = last(x)!;
        {
          // Merge by head
          const y = getFromSet(byHead[b], (c) => c !== x);
          if (y) {
            const [, ...rest] = y;
            x.push(...rest);
            merged.add(y);
            byHead[b].delete(y);
            continue;
          }
        }
        {
          // Merge by tail
          const y = getFromSet(byTail[b], (c) => c !== x);
          if (y) {
            const [, ...rest] = [...y].reverse();
            x.push(...rest);
            merged.add(y);
            byTail[b].delete(y);
            continue;
          }
        }
      }
    }
    if (!merged.size) break;
    xs = xs.filter((s) => !merged.has(s));
  }
  return xs;
}

function parseNetwork({
  map: m,
  options: { vert = "v", edge = "e", color = "#151d2f" },
}: ParseNetworkWorkerParameters) {
  const lines = m.split(/\r?\n/);

  const edges = lines
    .filter((c) => c.startsWith(edge))
    .map((c: string) => {
      const [, a, b] = c.split(" ");
      return +a > +b ? [+b, +a] : [+a, +b];
    });

  // Parse vertices
  const verts = lines
    .filter((c) => c.startsWith(vert))
    .map((c: string) => {
      const [, , x, y] = c.split(" ");
      return { x: +x, y: +y };
    });

  const optimizedEdges = optimizeNetworkEdges(edges);

  const ab = aabb(verts);
  return {
    bounds: ab,
    log: [
      `${verts.length} vertices, ${pluralize(
        "edge",
        optimizedEdges.length,
        true
      )}, ${((optimizedEdges.length * 100) / (edges.length ?? 1)).toFixed(
        2
      )}% of original`,
    ],
    nodes: optimizedEdges
      .map((points) => ({
        $: "path",
        points: points.map((i) => verts[i]),
        fill: color,
        alpha: 1,
        lineWidth: clamp(mean([ab.width, ab.height]) / 200, 0.5, 80),
      }))
      .map((c) => ({
        component: c,
      })),
  };
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ParseNetworkWorkerParameters>) =>
    parseNetwork(data)
);
