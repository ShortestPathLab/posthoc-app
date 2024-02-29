import { constant, identity } from "lodash";
import memo from "memoizee";
import { byPoint } from "../../NodeMatcher";
import { MapEditor, MapParser, ParsedMapHydrator } from "../Parser";
import { Options } from "./parseNetwork.worker";
import { parseNetworkAsync } from "./parseNetworkAsync";
import { Typography as Type } from "@mui/material";

export const parse: MapParser = memo(
  async (m = "", options: Options) =>
    await parseNetworkAsync({
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

export const editor: MapEditor<unknown> = async () => () =>
  (
    <>
      <Type variant="body2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
        No options available.
      </Type>
    </>
  );