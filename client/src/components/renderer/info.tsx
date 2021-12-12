import { SelectionInfo } from "components/renderer/Renderer";
import { findIndex, findLastIndex, take } from "lodash";
import { Trace, TraceEvent } from "protocol/Trace";

export function info(
  { eventList }: Trace = {},
  playback: number = 0,
  key: number | undefined = undefined,
  getStep: (s: TraceEvent) => boolean
) {
  const nodes = take(eventList, playback + 1);
  const step = findLastIndex(nodes, getStep);
  const entry = findIndex(
    eventList,
    (s) => s.type === "expanding" && getStep(s)
  );
  return {
    current: step !== -1 ? { index: step, event: nodes[step] } : undefined,
    entry: entry !== -1 ? { index: entry, event: nodes[entry] } : undefined,
    node: key !== undefined ? { key } : undefined,
  } as SelectionInfo;
}
