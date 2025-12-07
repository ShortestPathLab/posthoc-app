import * as grid from "./grid";
import * as mesh from "./mesh";
import * as xy from "./network";
import { MapEditor, MapParser, ParsedMapHydrator } from "./Parser";
import * as poly from "./poly";

export const mapParsers: Record<
  string,
  {
    parse: MapParser;
    hydrate: ParsedMapHydrator;
    editor: MapEditor<any>;
  }
> = {
  grid,
  map: grid,
  xy,
  mesh,
  poly,
};
