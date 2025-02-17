import { useTheme } from "@mui/material";
import interpolate from "color-interpolate";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import {
  Highlighting,
  highlightNodesOptions,
  Subtree,
} from "hooks/useHighlight";
import {
  Dictionary,
  forEach,
  forEachRight,
  forOwn,
  get,
  isEmpty,
  map,
  max,
  min,
  slice,
  startCase,
  trimStart,
  truncate,
} from "lodash";
import memoizee from "memoizee";
import { useMemo } from "react";
import { AccentColor, getShade } from "theme";
import { makeEdgeKey } from "./makeEdgeKey";
import {
  isDefined,
  setAttributes,
  SEVEN_CLASS_GNBU,
  TreeGraphProps,
} from "./TreeGraph";

export function useGraphColoring(
  graph: MultiDirectedGraph,
  { showAllEdges, trackedProperty, trace, step = 0 }: TreeGraphProps,
  highlightEdges?: Highlighting
) {
  const theme = useTheme();

  const gradient = interpolate([
    theme.palette.background.paper,
    theme.palette.text.primary,
  ]);

  return useMemo(() => {
    const isHighlightEdges = !isEmpty(highlightEdges);
    const r = memoizee((a: string) => interpolate([gradient(0.1), a]));
    const pastSteps = 400;
    const n = gradient(0.1);
    graph.forEachNode((v) => {
      setAttributes(graph, v, "node", {
        color: n,
        forceLabel: false,
        label: truncate(v, { length: 15 }),
      });
    });
    graph.forEachEdge((v) => {
      const isFinal = graph.getEdgeAttribute(v, "final");
      setAttributes(graph, v, "edge", {
        color: n,
        hidden: !showAllEdges && !isFinal,
        forceLabel: false,
        label: "",
      });
    });
    const isSetNode: Dictionary<boolean> = {};
    const isSet: Dictionary<boolean> = {};

    (showAllEdges ? forEach : forEachRight)(
      slice(trace?.events, 0, step + 1),
      ({ id, type, pId }, i) => {
        const color = getColorHex(type);
        const finalColor = r(color)(
          isHighlightEdges ? 0.1 : max([1 - (step - i) / pastSteps, 0.3])!
        );
        if (graph.hasNode(`${id}`) && !isSetNode[id]) {
          setAttributes(graph, `${id}`, "node", {
            color: finalColor,
            label: truncate(`${startCase(type)} ${id}`, { length: 15 }),
            forceLabel: step === i,
          });
          const a = makeEdgeKey(id, pId);
          if (
            isDefined(pId) &&
            graph.hasNode(`${pId}`) &&
            graph.hasEdge(a) &&
            !isSet[a]
          ) {
            setAttributes(graph, a, "edge", {
              forceLabel: step === i,
              color: finalColor,
              label: `Step ${i}`,
              hidden: false,
            });
            if (!showAllEdges) isSet[a] = true;
          }
          if (!showAllEdges) isSetNode[id] = true;
        }
      }
    );

    /**
     * Get a high-contrast shade of a theme color for use on the graph
     */
    const getThemeColor = (c: AccentColor = "grey") =>
      getShade(c, theme.palette.mode);

    // Force show a label for the current highlighted node
    if (highlightEdges && isHighlightEdges) {
      const current = trace?.events?.[highlightEdges?.step];
      graph.setNodeAttribute(current?.id, "forceLabel", "true");
      graph.setNodeAttribute(
        current?.id,
        "label",
        `${graph.getNodeAttribute(current?.id, "label")} (${startCase(
          highlightEdges.type
        )})`
      );
    }

    // highlight nodes: backtracking
    if (
      highlightEdges?.type === "backtracking" &&
      Array.isArray(highlightEdges.path)
    ) {
      let prev =
        trace?.events?.[highlightEdges?.path?.[highlightEdges?.path.length - 1]]
          ?.id;

      forEachRight(highlightEdges.path, (step) => {
        const node = trace?.events?.[step].id;
        const c = highlightNodesOptions.find(
          (t) => t.type === highlightEdges.type
        );
        if (graph.hasNode(`${node}`)) {
          graph.setNodeAttribute(`${node}`, "color", getThemeColor(c?.color));
          if (node != prev) {
            const edge = makeEdgeKey(`${node}`, `${prev}`);
            if (graph.hasEdge(edge)) {
              graph.setEdgeAttribute(edge, "color", getThemeColor(c?.color));
            }
          }
          prev = node;
        }
      });
    }

    // highlight nodes: SubTree
    if (
      (highlightEdges?.type === "subtree" ||
        highlightEdges?.type === "precedent") &&
      typeof highlightEdges?.path === "object" &&
      !Array.isArray(highlightEdges?.path)
    ) {
      const c = highlightNodesOptions.find(
        (t) => t.type === highlightEdges.type
      );

      const isSubtree = highlightEdges?.type === "subtree";

      function iterateSubtree(subtree: Subtree) {
        forOwn(subtree, (childs: Subtree, parent: string | number) => {
          const pNode = trace?.events?.[Number(parent)].id;
          if (graph.hasNode(`${pNode}`)) {
            graph.setNodeAttribute(
              `${pNode}`,
              "color",
              getThemeColor(c?.color)
            );
          }
          forOwn(childs, (v, child) => {
            const cNode = trace?.events?.[Number(child)].id;
            if (graph.hasNode(`${cNode}`)) {
              graph.setNodeAttribute(
                `${cNode}`,
                "color",
                getThemeColor(c?.color)
              );
              const edge = isSubtree
                ? makeEdgeKey(`${cNode}`, `${pNode}`)
                : makeEdgeKey(`${pNode}`, `${cNode}`);
              if (graph.hasEdge(edge)) {
                graph.setEdgeAttribute(edge, "color", getThemeColor(c?.color));
                graph.setEdgeAttribute(edge, "hidden", false);
              }
            }
          });
          iterateSubtree(childs);
        });
      }
      iterateSubtree(highlightEdges?.path);
    }

    if (trackedProperty) {
      const p = trimStart(trackedProperty, ".");
      const minVal = min(map(trace?.events, (e) => get(e, p)));
      const maxVal = max(map(trace?.events, (e) => get(e, p)));
      const f = (x: number) => {
        if (isNaN(minVal) || isNaN(maxVal) || isNaN(x)) {
          return 0;
        } else return (x - minVal) / (maxVal - minVal);
      };
      const scale = interpolate(SEVEN_CLASS_GNBU);
      forEach(slice(trace?.events, 0, step + 1), (e) => {
        if (graph.hasNode(`${e.id}`)) {
          const s = scale(f(get(e, p)));
          graph.setNodeAttribute(`${e.id}`, "color", s);
          if (isDefined(e.pId)) {
            const a = makeEdgeKey(`${e.id}`, `${e.pId}`);
            if (graph.hasDirectedEdge(a)) {
              graph.setEdgeAttribute(a, "color", s);
            }
          }
        }
      });
    }
    return { graph };
  }, [
    graph,
    step,
    trace,
    showAllEdges,
    highlightEdges,
    trackedProperty,
    theme,
  ]);
}
