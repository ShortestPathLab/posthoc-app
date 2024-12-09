import { set, find, chain, forEach, forEachRight, findLast } from "lodash";
import { useLayer } from "slices/layers";
import { useCallback } from "react";
import { produce } from "produce";
import { makePathIndex } from "layers/trace";
import { Z } from "vitest/dist/chunks/reporters.D7Jzd9GS";

export const HighlightNodes = [
  { type: "BackTracking", color: "#00ffd9" },
  { type: "SubTree", color: "#32a852" },
  { type: "Bounds Relevant", color: "#6932a8" },
];

export type highlightLayerType = {
  BackTracking: {
    type: string;
    path: number[];
  };
  SubTree: {
    type: string;
    path: Subtree;
  };
};

export interface Subtree {
  [key: number]: Subtree;
}

export function useHighlightNodes(key?: string) {
  const { layer, setLayer } = useLayer(key);
  const trace = layer?.source?.trace?.content;
  type A = {
    id: string | number;
    pId?: string | number | null | undefined;
    step: number;
    prev?: A;
  };

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
      }
    },
    [layer?.source?.highlighting, trace]
  );

  const groupedTrace = chain(trace?.events)
    .map((c, i) => ({ step: i, id: c.id, pId: c.pId }))
    .groupBy("pId")
    .value();

  const getAllSubtreeNodes = (
    root: A,
    visited = new Set<number | string>()
  ): Subtree => {
    if (visited.has(root.step)) {
      return {};
    }
    visited.add(root.step);
    // get all the child nodes of current node
    const children = groupedTrace[root.id];
    if (!children || children.length < 1) return {};
    const subtree: Subtree = {};

    if (children) {
      console.log(children, "children");
      const groupedChildren = chain(children)
        .map((c, i) => ({ step: c.step, id: c.id, pId: c.pId }))
        .groupBy("id")
        .value();

      forEach(groupedChildren, (child) => {
        // cannot reach the end of some branch
        const event = findLast(child, (c) => c.step >= root!.step);
        if (event && !subtree[event.step]) {
          subtree[event.step] = getAllSubtreeNodes(event, visited);
        }
      });
    }
    return subtree;
  };

  const showSubTree = useCallback(
    (step: number) => {
      let current: A = { ...(trace.events ?? [])[step], step };
      const path = {
        [current.step]: getAllSubtreeNodes(current, new Set<number>()),
      };
      if (Object.keys(path[current.step]).length >= 1) {
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
