import { Dictionary, memoize } from "lodash";
import { parse as parseGrid } from "./grid";
import { MapParser } from "../Parser";

export const mapParsers: Dictionary<MapParser> = { grid: memoize(parseGrid) };
