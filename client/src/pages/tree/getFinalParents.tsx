import { Dictionary, forEach } from "lodash";
import { Trace } from "protocol";
import { Key } from "./treeLayout.worker";

export function getFinalParents(trace: Trace | undefined) {
  const finalParent: Dictionary<Key> = {};
  forEach(trace?.events, ({ id, pId }) => {
    finalParent[id] = pId;
  });
  return finalParent;
}
