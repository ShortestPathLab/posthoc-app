import { constant, identity, noop } from "lodash";
import { byPoint } from "../../NodeMatcher";
import { MapParser } from "../Parser";
import type { Options } from "./parseNetwork.worker";
import { parseNetworkAsync } from "./parseNetworkAsync";

export const parse: MapParser = async (m = "", options: Options) => {
  const result = await parseNetworkAsync({
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
