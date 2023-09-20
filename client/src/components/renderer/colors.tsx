import {
  blue,
  deepPurple,
  green,
  grey,
  orange,
  pink,
  red,
  yellow,
} from "@mui/material/colors";
import { mapValues } from "lodash";
import { EventTypeColors } from "protocol";
import { TraceEventType } from "protocol/Trace";

const tint = "500";

export function hex(h: string) {
  return parseInt(h.replace("#", "0x"));
}

export const colorsHex: EventTypeColors = {
  source: green["A400"],
  destination: red["A400"],
  updating: orange[tint],
  expanding: deepPurple[tint],
  generating: yellow[tint],
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

export function getColorHex(key?: TraceEventType) {
  return (key && colorsHex[key]) ?? grey[tint];
}
