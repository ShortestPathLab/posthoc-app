import { mapValues } from "lodash";
import { EventTypeColors } from "protocol";
import { TraceEventType } from "protocol/Trace";
import {
  blue,
  deepPurple,
  green,
  grey,
  orange,
  pink,
  red,
  amber,
} from "@mui/material/colors";

const tint = "500";

export function hex(h: string) {
  return parseInt(h.replace("#", "0x"));
}

export const colorsHex: EventTypeColors = {
  source: green["A400"],
  destination: red["A400"],
  updating: orange[tint],
  expanding: deepPurple[tint],
  generating: amber[tint],
  closing: pink[tint],
  end: blue["A400"],
};

export const colors: { [K in TraceEventType]: number } = mapValues(
  colorsHex,
  hex
);

export function getColor(key?: TraceEventType) {
  return (key && colors[key]) || hex(orange[tint]);
}

export function getColorHex(
  key?: TraceEventType,
  fallback: string = grey[tint]
) {
  return (key && colorsHex[key]) ?? fallback;
}
