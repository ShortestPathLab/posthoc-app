import { Dictionary } from "lodash";
import memoize from "memoizee";
import { parse as parseGrid } from "./grid";
import { MapParser } from "../Parser";

export const mapParsers: Dictionary<MapParser> = {
  grid: memoize(parseGrid, { normalizer: JSON.stringify }),
};
