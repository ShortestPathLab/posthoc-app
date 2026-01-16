import { useTheme } from "@mui/material";
import { MultiDirectedGraph } from "graphology";
import { forEach } from "lodash-es";
import { Trace } from "protocol";
import { useMemo } from "react";
import { getFinalParents } from "./getFinalParents";
import { makeEdgeKey } from "./makeEdgeKey";
import { isDefined } from "./TreeGraph";
import { TreeWorkerReturnType } from "./treeLayout.worker";

export function useMultiDirectedGraph(
  trace: Trace | undefined,
  tree: TreeWorkerReturnType | undefined,
  orientation: "horizontal" | "vertical" = "horizontal",
) {
  const theme = useTheme();
  const finalParents = useMemo(() => getFinalParents(trace), [trace]);

  return useMemo(() => {
    const isVertical = orientation === "vertical";
    const graph = new MultiDirectedGraph();
    forEach(tree, (v) => {
      graph.addNode(v.label, {
        x: isVertical ? v.x : -v.y,
        y: isVertical ? v.y : -v.x,
        label: v.label,
        size: Math.log(v.size) + 2,
        color: theme.palette.action.disabledBackground,
      });
    });

    const numParents: Record<string, Set<string | number>> = {};
    forEach(trace?.events, ({ id, pId }) => {
      if (id && pId) {
        numParents[id] = numParents[id] ?? new Set();
        numParents[id].add(pId);
      }
    });

    forEach(trace?.events, ({ id, pId }) => {
      if (isDefined(pId) && graph.hasNode(`${pId}`)) {
        const key = makeEdgeKey(id, pId);
        if (!graph.hasEdge(key) && graph.hasNode(`${id}`)) {
          graph.addDirectedEdgeWithKey(key, `${pId}`, `${id}`, {
            label: "",
            color: "white",
            size: 2,
            final: finalParents[id] === pId,
          });
        }
        if (graph.hasDirectedEdge(key)) {
          graph.updateEdgeAttribute(
            key,
            "size",
            (s) => Math.log(Math.E ** (s - 0.5) + 0.5) + 0.5,
          );
        }
      }
    });

    return graph;
  }, [
    trace,
    tree,
    finalParents,
    orientation,
    theme.palette.action.disabledBackground,
  ]);
}
