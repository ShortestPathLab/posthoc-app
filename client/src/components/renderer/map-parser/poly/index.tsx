import { constant, identity } from "lodash";
import memo from "memoizee";
import { byPoint } from "../../NodeMatcher";
import { MapParser, ParsedMap, ParsedMapHydrator } from "../Parser";
import type { Options } from "./parsePoly.worker";
import { parsePolyAsync } from "./parsePolyAsync";

export const parse: MapParser = memo(
  async (m = "", options: Options) =>
    await parsePolyAsync({
      map: m,
      options,
    }),
  { normalizer: JSON.stringify }
);

export const hydrate: ParsedMapHydrator = (result: ParsedMap) => ({
  ...result,
  snap: identity,
  nodeAt: constant(0),
  pointOf: constant({ x: 0, y: 0 }),
  matchNode: byPoint,
});
