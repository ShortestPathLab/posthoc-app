import { constant, identity, noop } from "lodash";
import { byPoint } from "../../NodeMatcher";
import { MapParser } from "../Parser";
import type { Options } from "./parseMesh.worker";
import { parseMeshAsync } from "./parseMeshAsync";

export const parse: MapParser = async (m = "", options: Options) => {
  const result = await parseMeshAsync({
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
