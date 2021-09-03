import { mapValues } from "lodash";
import { TraceEventType } from "protocol/Trace";
import {
  green,
  blue,
  orange,
  yellow,
  red,
  purple,
  blueGrey,
} from "@material-ui/core/colors";

const tint = "500";

function convert(hex: string) {
  return parseInt(hex.replace("#", "0x"));
}

export const colors: { [K in TraceEventType]: number } = mapValues(
  {
    source: green[tint],
    destination: red[tint],
    expanding: orange[tint],
    generating: yellow[tint],
    closing: blueGrey[tint],
  },
  convert
);

export function getColor(key?: TraceEventType) {
  return key ? colors[key] ?? convert(blue[tint]) : convert(blue[tint]);
}
