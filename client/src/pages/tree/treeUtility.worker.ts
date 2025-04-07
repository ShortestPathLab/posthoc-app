import {
  clone,
  entries,
  find,
  forEach,
  groupBy,
  sumBy,
  times,
} from "lodash-es";
import { arrayToTree } from "performant-array-to-tree";
import { Trace, TraceEvent } from "protocol";
import { usingMessageHandler } from "workers/usingWorker";
import { _ } from "utils/chain";
export type EventTree = {
  id: Key;
  name: string;
  children?: EventTree[];
  cumulativeChildCount: number;
  events: { data: TraceEvent; step: number; pId: Key; id: Key }[];
  pId: Key;
  parent?: EventTree;
};

type Key = string | number | null | undefined;

export function degreeSeparation(tree: EventTree, radius: number) {
  const path = new Set<Key>([tree.id]);
  let root = tree;
  let startingDepth = radius;
  times(radius, () => {
    if (root.parent) {
      root = root.parent;
      path.add(root.id);
      startingDepth -= 1;
    }
  });
  function prune(node: EventTree, depth = startingDepth) {
    if (depth >= 0) {
      forEach(node.children, (c) =>
        prune(c, path.has(c.id) ? depth + 1 : depth - 1)
      );
    } else {
      node.children = [];
    }
    return node;
  }
  function addPathToRoot(node: EventTree) {
    const { parent } = node;
    if (parent) {
      parent.children = [node];
      return addPathToRoot(parent);
    } else {
      return node;
    }
  }
  const pruned = prune(clone(root));
  return addPathToRoot(pruned);
}

function parse({ trace, step = 0, radius }: TreeWorkerParameters) {
  function addParents(tree: EventTree) {
    forEach(tree.children, (t) => {
      t.parent = tree;
      addParents(t);
    });
  }
  function traverse(f: (t: EventTree) => void, tr: EventTree) {
    f(tr);
    forEach(tr.children, (tre) => traverse(f, tre));
  }
  function addChildCount(tree: EventTree) {
    if (tree.children?.length) {
      forEach(tree.children, addChildCount);
      const sumA = sumBy(tree.children, "cumulativeChildCount");
      tree.cumulativeChildCount = sumA + tree.children.length;
      return tree;
    } else {
      tree.cumulativeChildCount = 0;
    }
    return tree;
  }
  if (!trace) return;
  const nodes = _(
    trace.events ?? [],
    (t) => t.map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId })),
    (t) => groupBy(t, "id"),
    entries,
    (t) =>
      t.map(([k, v]) => ({
        id: k,
        name: k,
        events: v,
        pId:
          find(v, (s) => !!s.pId && s.step <= step)?.pId ||
          find(v, (s) => !!s.pId)?.pId,
      }))
  );

  const tree = arrayToTree(nodes, {
    dataField: null,
    parentId: "pId",
  }) as EventTree[];

  forEach(tree, addParents);

  const idToNode: Record<string, EventTree> = {};

  forEach(tree, (tr) =>
    traverse((t) => {
      if (t.id != null) {
        idToNode[t.id] = t;
      }
    }, tr)
  );

  forEach(tree, addChildCount);
  const id = trace?.events?.[step]?.id;
  if (id && radius !== undefined) {
    const node = idToNode[id];
    return { tree: degreeSeparation(node, radius) };
  } else return { tree };
}
export type TreeWorkerParameters = {
  trace?: Trace;
  step?: number;
  radius?: number;
};

export type TreeWorkerReturnType =
  | {
      tree: EventTree[];
    }
  | undefined;

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<TreeWorkerParameters>) => parse(data)
);
