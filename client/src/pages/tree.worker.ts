import { chain, Dictionary, find, forEach, sumBy, times } from "lodash";
import { arrayToTree } from "performant-array-to-tree";
import { Trace, TraceEvent } from "protocol";

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
    const parent = node.parent;
    if (parent) {
      parent.children = [node];
      return addPathToRoot(parent);
    } else {
      return node;
    }
  }
  const pruned = prune(structuredClone(root));
  return addPathToRoot(pruned);
}

function parse({ trace, step = 0, radius }: TreeWorkerParameters) {
  if (trace) {
    const r = chain(trace.events)
      .map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId }))
      .groupBy("id")
      .entries()
      .map(([k, v]) => ({
        id: k,
        name: k,
        events: v,
        pId:
          find(v, (s) => !!s.pId && s.step <= step)?.pId ||
          find(v, (s) => !!s.pId)?.pId,
      }))
      .value();

    const tree = arrayToTree(r, {
      dataField: null,
      parentId: "pId",
    }) as EventTree[];

    function addParents(tree: EventTree) {
      forEach(tree.children, (t) => {
        t.parent = tree;
        addParents(t);
      });
    }

    forEach(tree, addParents);

    const idToNode: Dictionary<EventTree> = {};

    function traverse(f: (t: EventTree) => void, tr: EventTree) {
      f(tr);
      forEach(tr.children, (tre) => traverse(f, tre));
    }

    forEach(tree, (tr) =>
      traverse((t) => {
        if (t.id !== null && t.id !== undefined) {
          idToNode[t.id] = t;
        }
      }, tr)
    );

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

    forEach(tree, addChildCount);
    const id = trace?.events?.[step]?.id;
    if (id && radius !== undefined) {
      const node = idToNode[id];
      return { tree: degreeSeparation(node, radius) };
    } else return { tree };
  }
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

onmessage = ({ data }: MessageEvent<TreeWorkerParameters>) => {
  postMessage(parse(data));
};