import { Dictionary } from "lodash";
import { MapParser, ParsedMapHydrator } from "./Parser";
import * as grid from "./grid";
import * as mesh from "./mesh";
import * as xy from "./network";
import * as poly from "./poly";

export const mapParsers: Dictionary<{
  parse: MapParser;
  hydrate: ParsedMapHydrator;
}> = {
  grid,
  xy,
  mesh,
  poly,
};
