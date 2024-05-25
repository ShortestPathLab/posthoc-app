import { chunk, Dictionary, flatten, identity, maxBy, minBy } from "lodash";
import pluralize from "pluralize";
import { Point } from "protocol";
import { ParsedMap } from "../Parser";
import { usingMessageHandler } from "../../../../workers/usingWorker";

export type Options = {
  color?: string;
};

export type ParsePolyWorkerParameters = {
  map: string;
  options: Options;
};

export type ParsePolyWorkerReturnType = Pick<
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

function parsePoly({
  map: m,
  options: { color = "#151d2f" },
}: ParsePolyWorkerParameters) {
  const lines = m.split(/\r?\n/);

  const [, counts, ...rest] = lines.filter(identity);

  const [enclosureCount] = counts.split(" ").map(parseInt);

  const lines2 = rest.map((line) => line.split(" ").map(parseFloat));

  const polys = lines2.map((face) => chunk(face.slice(1), 2));
  const enclosures = polys.slice(0, enclosureCount);
  const obstacles = polys.slice(enclosureCount);

  const ab = aabb(flatten(polys).map(([x, y]) => ({ x, y })));
  return {
    bounds: ab,
    log: [`${pluralize("face", polys.length, true)}`],
    nodes: [
      ...enclosures.map((xs) => ({
        $: "path",
        points: [...xs, xs[0]].map(([x, y]) => ({ x, y })),
        fill: color,
        alpha: 1,
      })),
      ...obstacles.map((xs) => ({
        $: "polygon",
        points: xs.map(([x, y]) => ({ x, y })),
        fill: color,
        alpha: 1,
      })),
    ].map((c) => ({
      component: c,
    })),
  };
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ParsePolyWorkerParameters>) => parsePoly(data)
);
