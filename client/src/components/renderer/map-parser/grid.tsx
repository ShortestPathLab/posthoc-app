import { byPoint } from "../NodeMatcher";
import { MapParser } from "../Parser";
import { parseGridAsync } from "./parseGridWorker";
import type { Options } from "./parseGrid.worker";

const { floor } = Math;

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

export const parse: MapParser = async (m = "", options: Options) => {
  const { width, height, ...rest } = await parseGridAsync({
    map: m,
    options,
  });
  return {
    ...rest,
    snap: ({ x: x1, y: y1 }, scale = 1) => {
      const [x, y] = [floor(x1 + scale / 2), floor(y1 + scale / 2)];
      if (between(x, 0, width) && between(y, 0, height)) return { x, y };
    },
    nodeAt: (point) => {
      const { x, y } = point;
      return y * width + x;
    },
    pointOf: (node) => ({ x: node % width, y: ~~(node / width) }),
    matchNode: byPoint,
  };
};
