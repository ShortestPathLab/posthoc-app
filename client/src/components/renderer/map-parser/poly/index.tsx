import { Typography as Type } from "@mui/material";
import { constant, identity } from "lodash-es";
import memo from "memoizee";
import { byPoint } from "../../NodeMatcher";
import { MapEditor, MapParser, ParsedMap, ParsedMapHydrator } from "../Parser";
import { Options } from "./parsePoly.worker";
import { parsePolyAsync } from "./parsePolyAsync";
import objectHash from "object-hash";

export const parse: MapParser = memo(
  async (m = "", options: Options) =>
    await parsePolyAsync({
      map: m,
      options,
    }),
  { normalizer: (args) => objectHash([...args]) }
);

export const hydrate: ParsedMapHydrator = (result: ParsedMap) => ({
  ...result,
  snap: identity,
  nodeAt: constant(0),
  pointOf: constant({ x: 0, y: 0 }),
  matchNode: byPoint,
});

// eslint-disable-next-line react/display-name
export const editor: MapEditor<unknown> = async () => () => (
  <Type
    component="div"
    variant="body2"
    color="text.secondary"
    sx={{ mb: 1, mt: 1 }}
  >
    No options available.
  </Type>
);
