import {
  Dictionary,
  entries,
  lowerCase,
  mapValues,
  thru,
  values,
} from "lodash";
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
import { accentColors } from "theme";
import md5 from "md5";

function hash(str: string) {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

export const tint = "500";

export function hex(h: string) {
  return parseInt(h.replace("#", "0x"));
}

export const searchEventAliases = thru(
  {
    source: ["source", "start"],
    destination: ["destination", "goal", "finish"],
    updating: ["update", "updating"],
    expanding: ["expanding", "expanding"],
    generating: ["generate", "generating", "open", "opening"],
    closing: ["close", "closing"],
    end: ["finish", "end"],
  },
  (dict) => {
    const out: Dictionary<string> = {};
    for (const [k, v] of entries(dict)) {
      for (const v1 of v) out[v1] = k;
    }
    return out;
  }
);

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
  return hex(getColorHex(key));
}

export function getColorHex(key: TraceEventType = "", fallback?: string) {
  const builtIn = searchEventAliases[lowerCase(key)];
  if (builtIn) {
    return colorsHex[key];
  } else if (fallback) {
    return fallback;
  } else {
    const n = hash(lowerCase(key));
    const colors = values(accentColors);
    return colors[n % colors.length][tint];
  }
}
