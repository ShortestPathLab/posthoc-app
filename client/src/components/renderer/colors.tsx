import {
  blueGrey,
  deepOrange,
  orange,
  pink,
  teal,
  yellow,
} from "@material-ui/core/colors";
import { mapValues } from "lodash";
import { TraceEventType } from "protocol/Trace";

const tint = "500";

export function hex(h: string) {
  return parseInt(h.replace("#", "0x"));
}

export const colorsHex = {
  source: teal["A400"],
  destination: pink["A400"],
  expanding: deepOrange[tint],
  generating: yellow[tint],
  closing: blueGrey["200"],
  end: pink["A400"],
};

export const colors: { [K in TraceEventType]: number } = mapValues(
  colorsHex,
  hex
);

export function getColor(key?: TraceEventType) {
  return (key && colors[key]) || hex(orange[tint]);
}

export function getColorHex(key?: TraceEventType) {
  return (key && colorsHex[key]) ?? orange[tint];
}
