import { mapValues } from "lodash";
import { EventTypeColoursTypeHex } from "../pixi/PixiStage";
import { EventTypeColoursType } from "theme";

export function hex(h: string) {
  return parseInt(h.replace("#", "0x"));
}

export function coloursToHex(colours:EventTypeColoursType):EventTypeColoursTypeHex {
  return mapValues(
    colours,
    hex
  );
}