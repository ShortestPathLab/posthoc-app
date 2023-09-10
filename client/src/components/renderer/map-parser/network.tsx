import { noop } from "lodash";
import { byPoint } from "../NodeMatcher";
import { MapParser } from "../Parser";
import type { Options } from "./parseNetwork.worker";
import { parseNetworkAsync } from "./parseNetworkWorker";

export const parse: MapParser = async (m = "", options: Options) => {
  const result = await parseNetworkAsync({
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
