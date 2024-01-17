import { mapParsers } from "./map-parser";

export function getParser(key = "") {
  return mapParsers[key];
}
