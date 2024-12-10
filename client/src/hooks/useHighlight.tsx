import { set, find, chain, forEach, forEachRight, findLast } from "lodash";
import { useLayer } from "slices/layers";
import { useCallback } from "react";
import { produce } from "produce";
import { makePathIndex } from "layers/trace";

export const HighlightNodes = [
  { type: "BackTracking", color: "#00ffd9" },
  { type: "SubTree", color: "#32a852" },
  { type: "Bounds Relevant", color: "#6932a8" },
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

  // use id
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
        if (event && !subtree[event.id]) {
          subtree[event.id] = getAllSubtreeNodes(event, visited);
        }
      });
    }
    return subtree;
  };

  const showSubTree = useCallback(
    (step: number) => {
      let current: Node = { ...(trace?.events ?? [])[step], step };
      const path = {
        [current.id]: getAllSubtreeNodes(current, new Set<number>()),
      };
      if (Object.keys(path[current.id]).length > 0) {
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
