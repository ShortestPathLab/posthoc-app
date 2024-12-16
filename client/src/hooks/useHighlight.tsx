import { TraceLayerData } from "layers/trace";
import { isTraceLayer } from "layers/trace/isTraceLayer";
import { makePathIndex, Node } from "layers/trace/makePathIndex";
import { chain, find, forEach, noop, set } from "lodash";
import { produce } from "produce";
import { useCallback } from "react";
import { Layer, useLayer } from "slices/layers";
import { AccentColor } from "theme";
export const highlightNodesOptions = [
  {
    type: "backtracking",
    color: "cyan" satisfies AccentColor,
    description:
      "Show all events from the root to the currently selected event",
  },
  {
    type: "subtree",
    color: "green" satisfies AccentColor,
    description: "Show all consequences of the currently selected node",
  },
  {
    type: "bounds-relevant",
    color: "deepPurple" satisfies AccentColor,
    description: "",
  },
] as const;

export type HighlightLayerData = {
  highlighting?: {
    step: number;
    type: string;
    path: number[] | Subtree;
  };
};

export interface Subtree {
  [key: number]: Subtree;
}

export const isHighlightLayer = (
  layer: Layer
): layer is Layer<HighlightLayerData & TraceLayerData> =>
  // For now, we'll define highlighting layers as any search trace layer.
  // It could be better to decouple this "highlight-able" idea from search traces.
  isTraceLayer(layer);

export function useHighlightNodes(key?: string): {
  [K in (typeof highlightNodesOptions)[number]["type"]]: (step: number) => void;
} {
  const { layer, setLayer } = useLayer(key, isHighlightLayer);
  const trace = layer?.source?.trace?.content;

  const showBacktracking = useCallback(
    (step: number) => {
      if (trace) {
        const { getPath } = makePathIndex(trace);
        const path: number[] = getPath(step);
        if (path.length > 1) {
          setLayer(
            produce(layer, (l) =>
              set(l?.source!, "highlighting", {
                type: "backtracking",
                step,
                path,
              })
            )!
          );
        } else {
          setLayer(produce(layer, (l) => set(l?.source!, "highlighting", {}))!);
        }
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

  const showSubtree = useCallback(
    (step: number) => {
      const current: Node = { ...(trace?.events ?? [])[step], step };
      const path = {
        [current.step]: getAllSubtreeNodes(current, new Set<number>()),
      };
      if (Object.keys(path[current.step]).length > 0) {
        setLayer(
          produce(layer, (l) =>
            set(l?.source!, "highlighting", { type: "subtree", step, path })
          )!
        );
      } else {
        setLayer(produce(layer, (l) => set(l?.source!, "highlighting", {}))!);
      }
    },
    [layer?.source?.highlighting, trace]
  );
  return {
    backtracking: showBacktracking,
    subtree: showSubtree,
    ["bounds-relevant"]: noop,
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
