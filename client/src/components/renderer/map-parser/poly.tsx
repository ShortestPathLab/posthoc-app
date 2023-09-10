import { noop } from "lodash";
import { byPoint } from "../NodeMatcher";
import { MapParser } from "../Parser";
import type { Options } from "./parsePoly.worker";
import { parsePolyAsync } from "./parsePolyWorker";

export const parse: MapParser = async (m = "", options: Options) => {
  const result = await parsePolyAsync({
    map: m,
    options,
  });
  return {
    ...result,
    snap: noop as any,
    nodeAt: noop as any,
    pointOf: noop as any,
    matchNode: byPoint,
  };
};
