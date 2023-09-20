import { Dictionary } from "lodash";
import memoize from "memoizee";
import * as grid from "./grid";
import * as xy from "./network";
import * as mesh from "./mesh";
import * as poly from "./poly";
import { MapParser, ParsedMapHydrator } from "./Parser";

export const mapParsers: Dictionary<{
  parse: MapParser;
  hydrate: ParsedMapHydrator;
}> = {
  grid,
  xy,
  mesh,
  poly,
};
