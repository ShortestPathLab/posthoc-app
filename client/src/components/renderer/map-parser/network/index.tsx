import { constant, identity } from "lodash-es";
import memo from "memoizee";
import { byPoint } from "../../NodeMatcher";
import { MapEditor, MapParser, ParsedMapHydrator } from "../Parser";
import { Options } from "./parseNetwork.worker";
import { parseNetworkAsync } from "./parseNetworkAsync";
import { Typography as Type } from "@mui/material";
import objectHash from "object-hash";

export const parse: MapParser = memo(
  async (m = "", options: Options) =>
    await parseNetworkAsync({
      map: m,
      options,
    }),
  { normalizer: (args) => objectHash([...args]) }
);

export const hydrate: ParsedMapHydrator = (result) => ({
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
