import { fromPairs, map } from "es-toolkit/compat";
import { Trace } from "protocol";
import { flow } from "utils/flow";
import { Key } from "./treeLayout.worker";

export function getFinalParents(trace: Trace | undefined): Record<string, Key> {
  return flow(trace?.events ?? [], (events) => map(events, ({ id, pId }) => [id, pId]), fromPairs);
}
