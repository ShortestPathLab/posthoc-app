import { constant, identity } from "lodash";
import memo from "memoizee";
import { byPoint } from "../../NodeMatcher";
import { MapParser, ParsedMapHydrator } from "../Parser";
import { Options } from "./parseMesh.worker";
import { parseMeshAsync } from "./parseMeshAsync";

export const parse: MapParser = memo(
  async (m = "", options: Options) =>
    await parseMeshAsync({
      map: m,
      options,
    }),
  { normalizer: JSON.stringify }
);

export const hydrate: ParsedMapHydrator = (result) => ({
  ...result,
  snap: identity,
  nodeAt: constant(0),
  pointOf: constant({ x: 0, y: 0 }),
  matchNode: byPoint,
});