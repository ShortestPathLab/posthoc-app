import { constant, identity } from "lodash";
import { byPoint } from "../../NodeMatcher";
import { MapParser } from "../Parser";
import type { Options } from "./parsePoly.worker";
import { parsePolyAsync } from "./parsePolyAsync";

export const parse: MapParser = async (m = "", options: Options) => {
  const result = await parsePolyAsync({
    map: m,
    options,
  });
  return {
    ...result,
    snap: identity,
    nodeAt: constant(0),
    pointOf: constant({ x: 0, y: 0 }),
    matchNode: byPoint,
  };
};
