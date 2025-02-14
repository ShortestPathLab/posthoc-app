import interpolate from "color-interpolate";
import { chain as _, last, map, range } from "lodash";
import { Point, Size } from "protocol";
import { ParsedMap } from "../Parser";
import { getGridSymbols } from "./getGridSymbols.worker";
import { usingMessageHandler } from "workers/usingWorker";

function map2D<R>(cells: string[], iterator: (t: string) => R) {
  return map(cells, (row) => map(row, (cell) => iterator(cell)));
}

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
  symbols?: Record<string, string>;
  floor?: string;
  color?: string;
  background?: string;
};

export type ParseGridWorkerParameters = {
  map: string;
  options: Options;
};

export type ParseGridWorkerReturnType = Pick<
  ParsedMap,
  "log" | "bounds" | "nodes"
>;

function parseGrid({
  map: m,
  options: { symbols: colors = {}, color = "#fff", background = "#000" } = {},
}: ParseGridWorkerParameters): ParseGridWorkerReturnType {
  const lines = m.split(/\r?\n/);
  const [, h = "", w = "", , ...grid] = lines;
  const [width, height] = [w, h].map((d) => +last(d.split(" "))!);

  const { symbols } = getGridSymbols({ map: m });

  const gradient = interpolate([background, color]);

  const nodes = _(symbols)
    .filter(({ value, symbol }) => !!value || !!colors[symbol])
    .map(({ symbol, value }) =>
      [undefined, "auto"].includes(colors[symbol])
        ? [symbol, gradient(value)]
        : [symbol, colors[symbol]]
    )
    .filter(([, color]) => !!color)
    .map(([symbol, color]) => {
      const nodes = optimizeGridMap(
        map2D(grid, (c) => c === symbol),
        { width, height }
      );
      return map(nodes, (node) => ({
        $: "rect",
        fill: color,
        alpha: 1,
        ...node,
      }));
    })
    .flatten()
    .value();

  return {
    log: [
      `${((nodes.length * 100) / (width * height)).toFixed(2)}% of original`,
    ],
    bounds: { width, height, minX: 0, minY: 0, maxX: width, maxY: height },
    nodes: nodes.map((c) => ({
      component: c,
    })),
  };
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ParseGridWorkerParameters>) => parseGrid(data)
);
