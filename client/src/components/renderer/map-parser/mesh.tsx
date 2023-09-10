import { noop } from "lodash";
import { byPoint } from "../NodeMatcher";
import { MapParser } from "../Parser";
import type { Options } from "./parseMesh.worker";
import { parseMeshAsync } from "./parseMeshWorker";

export const parse: MapParser = async (m = "", options: Options) => {
  const result = await parseMeshAsync({
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
