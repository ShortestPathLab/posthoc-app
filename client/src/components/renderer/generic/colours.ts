import { mapValues } from "lodash";
import { EventTypeColorsTypeHex } from "../pixi/PixiStage";
import { EventTypeColorsType } from "theme";

export function hex(h: string) {
  return parseInt(h.replace("#", "0x"));
}

export function colorsToHex(
  colors: EventTypeColorsType
): EventTypeColorsTypeHex {
  return mapValues(colors, hex);
}
