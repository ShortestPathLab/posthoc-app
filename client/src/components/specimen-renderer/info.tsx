import { SelectionInfo } from "components/specimen-renderer/Renderer";
import { findIndex, findLastIndex, take } from "lodash";
import { Trace } from "protocol/Trace";

export function info(specimen: Trace = {}, key: number = 0, step: number = 0) {
  const nodes = take(specimen?.eventList, step);
  const node = findLastIndex(nodes, { id: key });
  const entry = findIndex(specimen?.eventList, { type: "expanding", id: key });
  return {
    current: node !== -1 ? { index: node, event: nodes[node] } : undefined,
    entry: entry !== -1 ? { index: entry, event: nodes[entry] } : undefined,
    node: { key },
  } as SelectionInfo;
}
