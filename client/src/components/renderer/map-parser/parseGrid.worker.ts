import { last, map, range } from "lodash";
import { Point, Size } from "protocol";
import { MapInfo } from "../Parser";
import { Theme } from "@mui/material";

const { min } = Math;

type BooleanMap = boolean[][];

function get(m: BooleanMap, { x, y }: Point) {
  return !!m?.[y]?.[x];
}

export function expand(
  m: BooleanMap,
  mode: boolean,
  { x, y }: Point,
  max: Point
) {
  let x1 = x;
  let y1 = y;

  // expand diagonally
  while (x1 + 1 <= max.x && y1 + 1 <= max.y) {
    const h = range(x, x1 + 1).map((i) => get(m, { x: i, y: y1 + 1 }));
    if (h.includes(!mode)) break;
    const v = range(y, y1 + 2).map((i) => get(m, { x: x1 + 1, y: i }));
    if (v.includes(!mode)) break;
    x1++;
    y1++;
  }

  // expand vertically
  while (y1 + 1 <= max.y) {
    const h = range(x, x1 + 1).map((i) => get(m, { x: i, y: y1 + 1 }));
    if (h.includes(!mode)) break;
    y1++;
  }

  // expand horizontally
  while (x1 + 1 <= max.x) {
    const v = range(y, y1 + 1).map((i) => get(m, { x: x1 + 1, y: i }));
    if (v.includes(!mode)) break;
    x1++;
  }

  return { x: x1, y: y1 };
}

export function optimizeGridMap(
  m: BooleanMap,
  size: Size,
  offset: Point = { x: 0, y: 0 },
  max: Point = { x: size.width - 1, y: size.height - 1 }
): (Point & Size)[] {
  const stack: [Point, Point][] = [[offset, max]];
  const result: (Point & Size)[] = [];
  while (stack.length > 0) {
    const [offset, max] = stack.pop()!;
    if (offset.x <= max.x && offset.y <= max.y) {
      const mode = get(m, offset);
      const b = expand(m, mode, offset, max);
      stack.push(
        [
          { x: offset.x, y: b.y + 1 },
          { x: min(max.x, b.x), y: max.y },
        ],
        [
          { x: b.x + 1, y: offset.y },
          { x: max.x, y: max.y },
        ]
      );
      if (mode) {
        result.push({
          ...offset,
          width: b.x - offset.x + 1,
          height: b.y - offset.y + 1,
        });
      }
    }
  }
  return result;
}

export type Options = {
  floor?: string;
  color?: string;
};

export type ParseGridWorkerParameters = {
  map: string;
  options: Options;
};

export type ParseGridWorkerReturnType = Pick<
  MapInfo,
  "log" | "bounds" | "nodes"
>;

function parseGrid({
  map: m,
  options: { floor = ".", color = "#151d2f" } = {},
}: ParseGridWorkerParameters): ParseGridWorkerReturnType {
  const lines = m.split("\n");
  const [, h = "", w = "", , ...grid] = lines;
  const [width, height] = [w, h].map((d) => +last(d.split(" "))!);

  const nodes = optimizeGridMap(
    grid.map((l) => map(l, (c) => c !== floor)),
    { width, height }
  );

  return {
    log: [
      `${((nodes.length * 100) / (width * height)).toFixed(2)}% of original`,
    ],
    bounds: { width, height, minX: 0, minY: 0, maxX: width, maxY: height },
    nodes: nodes.map((node) => ({
      $: "rect",
      fill: color,
      alpha: 1,
      ...node,
    })),
  };
}

onmessage = ({ data }: MessageEvent<ParseGridWorkerParameters>) => {
  postMessage(parseGrid(data));
};
