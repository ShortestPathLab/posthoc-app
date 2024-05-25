import { Dictionary, identity, maxBy, minBy } from "lodash";
import pluralize from "pluralize";
import { Point } from "protocol";
import { ParsedMap } from "../Parser";
import { usingMessageHandler } from "../../../../workers/usingWorker";

export type Options = {
  color?: string;
};

export type ParseMeshWorkerParameters = {
  map: string;
  options: Options;
};

export type ParseMeshWorkerReturnType = Pick<
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

function parseMesh({
  map: m,
  options: { color = "#151d2f" },
}: ParseMeshWorkerParameters) {
  const lines = m.split(/\r?\n/);

  const [, , counts, ...rest] = lines.filter(identity);

  const [vertexCount] = counts.split(/\s+/).map(parseInt);

  const lines2 = rest.map((line) => line.split(/\s+/).map(parseFloat));

  // 1-indexed vertices
  const vertices = lines2.slice(0, vertexCount);

  const faces = lines2.slice(vertexCount);

  const tris = faces
    .filter(([x]) => !x)
    .map((face) => {
      const [, , a, b, c] = face;
      return [a, b, c].map((i) => vertices[i - 1]);
    });

  const ab = aabb(vertices.map(([x, y]) => ({ x, y })));
  return {
    bounds: ab,
    log: [`${pluralize("face", tris.length, true)}`],
    nodes: tris
      .map((points) => ({
        $: "polygon",
        points: points.map(([x, y]) => ({ x, y })),
        fill: color,
        alpha: 1,
      }))
      .map((c) => ({
        component: c,
      })),
  };
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ParseMeshWorkerParameters>) => parseMesh(data)
);
