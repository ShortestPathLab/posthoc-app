import {
  blue,
  blueGrey,
  green,
  orange,
  red,
  yellow,
} from "@material-ui/core/colors";
import { mapValues } from "lodash";
import { TraceEventType } from "protocol/Trace";

const tint = "500";

function convert(hex: string) {
  return parseInt(hex.replace("#", "0x"));
}

export const colors: { [K in TraceEventType]: number } = mapValues(
  {
    source: green[tint],
    destination: red[tint],
    expanding: blue[tint],
    generating: yellow[tint],
    closing: blueGrey[tint],
  },
  convert
);

export function getColor(key?: TraceEventType) {
  return key ? colors[key] ?? convert(orange[tint]) : convert(orange[tint]);
}
