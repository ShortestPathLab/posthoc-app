import { forEach } from "lodash-es";
import { Trace } from "protocol";
import { Key } from "./treeLayout.worker";

export function getFinalParents(trace: Trace | undefined) {
  const finalParent: Record<string, Key> = {};
  forEach(trace?.events, ({ id, pId }) => {
    finalParent[id] = pId;
  });
  return finalParent;
}
