import { Point, SelectionInfo } from "components/specimen-inspector/Renderer";
import { findIndex, findLastIndex, take } from "lodash";
import { Trace } from "protocol/Trace";

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
