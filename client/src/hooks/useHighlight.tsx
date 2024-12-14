import { set, find, chain, forEach } from "lodash";
import { useLayer } from "slices/layers";
import { useCallback } from "react";
import { produce } from "produce";
import { makePathIndex } from "layers/trace";

export const HighlightNodes = [
  {
    type: "BackTracking",
    color: "#00ffd9",
    desciption:
      "An event is path relevant if it appears on a path from the root to the currently selected event.",
  },
  {
    type: "SubTree",
    color: "#32a852",
    desciption:
      "A node is prefix relevant if it is a descendant of the currently selected node.",
  },
  { type: "Bounds Relevant", color: "#6932a8", desciption: "" },
];

export type highlightLayerType = {
  highlighting: {
    type: string;
    path: number[] | Subtree;
  };
};

export interface Subtree {
  [key: number]: Subtree;
}

type Node = {
  id: string | number;
  pId?: string | number | null | undefined;
  step: number;
  prev?: Node;
};

export function useHighlightNodes(key?: string): {
  [key: string]: Function;
} {
  const { layer, setLayer } = useLayer(key);
  const trace = layer?.source?.trace?.content;

  const showBackTracking = useCallback(
    (step: number) => {
      const { getPath } = makePathIndex(trace);
      const path: number[] = getPath(step);
      if (path.length > 1) {
        setLayer(
          produce(layer, (l) =>
            set(l?.source!, "highlighting", { type: "BackTracking", path })
          )!
        );
      } else {
        setLayer(produce(layer, (l) => set(l?.source!, "highlighting", {}))!);
      }
    },
    [layer?.source?.highlighting, trace]
  );

  const groupedTrace = chain(trace?.events)
    .map((c, i) => ({ step: i, id: c.id, pId: c.pId }))
    .groupBy("pId")
    .value();

  // use step
  const getAllSubtreeNodes = (
    root: Node,
    visited = new Set<number | string>()
  ): Subtree => {
    if (visited.has(root.id)) {
      return {};
    }
    visited.add(root.id);
    // get all the child nodes of current node
    const children = groupedTrace[root.id];
    if (!children || children.length < 1) return {};
    const subtree: Subtree = {};

    if (children) {
      const groupedChildren = chain(children)
        .map((c, i) => ({ step: c.step, id: c.id, pId: c.pId }))
        .groupBy("id")
        .value();

      forEach(groupedChildren, (child) => {
        const event = find(child, (c) => c.step >= root!.step);
        if (event && !subtree[event.step]) {
          subtree[event.step] = getAllSubtreeNodes(event, visited);
        }
      });
    }
    return subtree;
  };

  const showSubTree = useCallback(
    (step: number) => {
      let current: Node = { ...(trace?.events ?? [])[step], step };
      const path = {
        [current.step]: getAllSubtreeNodes(current, new Set<number>()),
      };
      if (Object.keys(path[current.step]).length > 0) {
        setLayer(
          produce(layer, (l) =>
            set(l?.source!, "highlighting", { type: "SubTree", path })
          )!
        );
      } else {
        setLayer(produce(layer, (l) => set(l?.source!, "highlighting", {}))!);
      }
    },
    [layer?.source?.highlighting, trace]
  );
  return {
    BackTracking: showBackTracking,
    SubTree: showSubTree,
  };
}

export function flattenSubtree(subtree: Subtree) {
  let result: number[] = [];

  function traverse(tree: Subtree, path: number[]) {
    for (const key in tree) {
      const numericKey = Number(key);
      result.push(numericKey);
      if (typeof tree[key] === "object" && tree[key] !== null) {
        traverse(tree[key], path.concat(numericKey));
      }
    }
  }

  traverse(subtree, []);
  return result;
}
