import {
  amber,
  blue,
  deepPurple,
  green,
  orange,
  pink,
  red,
} from "@mui/material/colors";
import { ColorTranslator } from "colortranslator";
import {
  Dictionary,
  entries,
  keys,
  lowerCase,
  mapValues,
  sortBy,
  thru,
  values,
} from "lodash";
import { EventTypeColors } from "protocol";
import { TraceEventType } from "protocol/Trace";
import { AccentColor, accentColors, getShade } from "theme";

function hash(str: string) {
  let hash = 5381,
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
    end: ["finish", "end", "solution"],
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

export const shades = sortBy(
  keys(accentColors) as AccentColor[],
  (c) => new ColorTranslator(getShade(c, "dark")).H
);

export function getColor(key?: TraceEventType) {
  return hex(getColorHex(key));
}

export function getColorHex(key: TraceEventType = "", fallback?: string) {
  const builtIn = searchEventAliases[lowerCase(key)];
  if (builtIn) {
    return colorsHex[builtIn];
  } else if (fallback) {
    return fallback;
  } else {
    const n = hash(lowerCase(key));
    const colors = values(accentColors);
    return colors[n % colors.length][tint];
  }
}
