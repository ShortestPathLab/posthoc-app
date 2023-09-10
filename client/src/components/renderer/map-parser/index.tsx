import { Dictionary } from "lodash";
import memoize from "memoizee";
import { parse as parseGrid } from "./grid";
import { parse as parseNetwork } from "./network";
import { parse as parseMesh } from "./mesh";
import { parse as parsePoly } from "./poly";
import { MapParser } from "../Parser";

export const mapParsers: Dictionary<MapParser> = {
  grid: memoize(parseGrid, { normalizer: JSON.stringify }),
  xy: memoize(parseNetwork, { normalizer: JSON.stringify }),
  mesh: memoize(parseMesh, { normalizer: JSON.stringify }),
  poly: memoize(parsePoly, { normalizer: JSON.stringify }),
};
