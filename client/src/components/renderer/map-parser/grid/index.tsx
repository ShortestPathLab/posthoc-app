import memo from "memoizee";
import { byPoint } from "../../NodeMatcher";
import { MapParser, ParsedMapHydrator } from "../Parser";
import { Options } from "./parseGrid.worker";
import { parseGridAsync } from "./parseGridAsync";

const { floor } = Math;

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

export const parse: MapParser = memo(
  async (m = "", options: Options) => {
    return {
      ...(await parseGridAsync({
        map: m,
        options,
      })),
    };
  },
  { normalizer: JSON.stringify }
);

export const hydrate: ParsedMapHydrator = (result) => {
  const { width, height } = result.bounds;
  return {
    ...result,
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