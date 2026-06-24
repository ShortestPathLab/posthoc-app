import { constant, identity } from "es-toolkit/compat";
import { byPoint } from "../../NodeMatcher";
import { MapEditor, MapParser, ParsedMapHydrator } from "../Parser";
import { Options } from "./parseNetwork.worker";
import { parseNetworkAsync } from "./parseNetworkAsync";
import { Typography as Type } from "@mui/material";

// Caching/dedup now lives in React Query (parseNetworkAsync → queryClient.fetchQuery).
export const parse: MapParser = async (m = "", options: Options) =>
  await parseNetworkAsync({ map: m, options });

export const hydrate: ParsedMapHydrator = (result) => ({
  ...result,
  snap: identity,
  nodeAt: constant(0),
  pointOf: constant({ x: 0, y: 0 }),
  matchNode: byPoint,
});

// eslint-disable-next-line react/display-name
export const editor: MapEditor<unknown> = async () => () => (
  <Type component="div" variant="body2" color="textSecondary" sx={{ mb: 1, mt: 1 }}>
    No options available.
  </Type>
);
