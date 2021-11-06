import { Point, SelectionInfo } from "components/specimen-renderer/Renderer";
import { findIndex, findLastIndex, take } from "lodash";
import { Trace } from "protocol/Trace";
import { parseMap } from "./parseMap";

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

export function selectionInfo(map: string = "", specimen: Trace = {}) {
  const [{ x: w, y: h }, , valid] = parseMap(map);
  return ({ x, y }: Point, step: number = 0) => {
    const nodes = take(specimen?.eventList, step);
    const node = findLastIndex(
      nodes,
      ({ variables: v }) => (v?.x ?? 0) === x && (v?.y ?? 0) === y
    );
    const entry = findIndex(
      specimen?.eventList,
      ({ variables: v, type }) =>
        type === "expanding" && (v?.x ?? 0) === x && (v?.y ?? 0) === y
    );
    return {
      current: node !== -1 ? { index: node, event: nodes[node] } : undefined,
      entry: entry !== -1 ? { index: entry, event: nodes[entry] } : undefined,
      node:
        between(x, 0, w) && between(y, 0, h) && valid({ x, y })
          ? { key: y * w + x }
          : undefined,
    } as SelectionInfo;
  };
}
