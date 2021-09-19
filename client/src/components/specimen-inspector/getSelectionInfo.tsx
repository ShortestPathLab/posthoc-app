import { take, findLastIndex, findIndex } from "lodash";
import { Trace, TraceEvent } from "protocol/Trace";
import { Point } from "./Renderer";

type Node = {
  index: number;
  event: TraceEvent;
};

export type SelectionInfo = {
  current?: Node;
  entry?: Node;
};

export function getSelectionInfo(
  { x, y }: Point,
  specimen: Trace,
  step: number
) {
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
    current: node === -1 ? undefined : { index: node, event: nodes[node] },
    entry: entry === -1 ? undefined : { index: entry, event: nodes[entry] },
  } as SelectionInfo;
}
