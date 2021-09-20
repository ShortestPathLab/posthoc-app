import { filter, flatMap as flat, map, split } from "lodash";
import { TraceEvent } from "protocol/Trace";

export function parseMap(m: string = "", wall: string = "@") {
  return filter(
    flat(split(m, "\n").slice(4), (row, y) =>
      map(row, (tile, x) =>
        tile === wall ? { variables: { x, y } } : undefined
      )
    )
  ) as TraceEvent[];
}
