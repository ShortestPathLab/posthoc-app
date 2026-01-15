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
  forEach,
  forEachRight,
  forOwn,
  get,
  isEmpty,
  isNumber,
  map,
  max,
  min,
  slice,
  startCase,
  trimStart,
  truncate,
} from "lodash-es";
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
import { assert } from "utils/assert";
import { TraceEvent } from "protocol/Trace-v140";

const getGradient = memoizee(
  (from: string, to: string) => {
    const gradient = interpolate([from, to]);

    return memoizee((base: string) => interpolate([gradient(0.1), base]), {
      normalizer: ([base]) => base, // memo by base color
    });
  },
  {
    normalizer: ([a, b]) => JSON.stringify([a, b]), // memo by bg/fg pair
  },
);

//
export function getGraphColorHex(
  eventType: string,
  strength: number,
  backgroundHex: string,
  foregroundHex: string,
): string {
  const t = Math.max(0, Math.min(1, strength));
  const blendFromNeutral = getGradient(backgroundHex, foregroundHex);
  const base = getColorHex(eventType);
  return blendFromNeutral(base)(t);
}

const defaultGetGraphId = (step: number, event: TraceEvent) => event.id;
const defaultGetGraphPId = (step: number, event: TraceEvent) => event.pId;
export function useGraphColoring(
  graph: MultiDirectedGraph,
  { showAllEdges, trackedProperty, trace, step = 0 }: TreeGraphProps,
  highlightEdges?: Highlighting,
  getGraphId = defaultGetGraphId,
  getGraphPId = defaultGetGraphPId,
) {
  "use no memo";
  // This hook modifies `graph`, which is against the rules of React.
  // TODO: fix this in the future.
  const theme = useTheme();

  const backgroundHex = theme.palette.background.paper;
  const foregroundHex = theme.palette.text.primary;

  return useMemo(() => {
    const isHighlightEdges = !isEmpty(highlightEdges);
    const pastSteps = 400;

    // Neutral base color for un-visited nodes/edges
    const neutralColor = getGraphColorHex(
      "neutral", // event type doesn’t matter when strength === 0
      0,
      backgroundHex,
      foregroundHex,
    );

    // Reset all nodes
    graph.forEachNode((v) => {
      setAttributes(graph, v, "node", {
        color: neutralColor,
        forceLabel: false,
        label: truncate(v, { length: 15 }),
      });
    });

    // Reset all edges
    graph.forEachEdge((v) => {
      const isFinal = graph.getEdgeAttribute(v, "final");
      setAttributes(graph, v, "edge", {
        color: neutralColor,
        hidden: !showAllEdges && !isFinal,
        forceLabel: false,
        label: "",
      });
    });

    const isSetNode: Record<string, boolean> = {};
    const isSet: Record<string, boolean> = {};

    // Walk events up to current step and apply fading color
    (showAllEdges ? forEach : forEachRight)(
      slice(trace?.events, 0, step + 1),
      (event, i) => {
        const { type } = event;
        const graphId = getGraphId(i, event);
        const graphPId = getGraphPId(i, event);
        const strength = isHighlightEdges
          ? 0.1
          : max([1 - (step - i) / pastSteps, 0.3])!;

        const finalColor = getGraphColorHex(
          type!,
          strength,
          backgroundHex,
          foregroundHex,
        );

        if (graph.hasNode(`${graphId}`) && !isSetNode[graphId]) {
          setAttributes(graph, `${graphId}`, "node", {
            color: finalColor,
            label: truncate(`${startCase(type)} ${graphId}`, { length: 15 }),
            forceLabel: step === i,
          });

          const a = makeEdgeKey(graphId, graphPId);
          if (
            isDefined(graphPId) &&
            graph.hasNode(`${graphPId}`) &&
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
          if (!showAllEdges) isSetNode[graphId] = true;
        }
      },
    );

    const getThemeColor = (c: AccentColor = "grey") =>
      getShade(c, theme.palette.mode);

    if (highlightEdges && isHighlightEdges) {
      assert(isNumber(highlightEdges?.step), "No step");
      const current = trace?.events?.[highlightEdges.step];
      assert(current, "No current event");
      graph.setNodeAttribute(current.id, "forceLabel", "true");
      graph.setNodeAttribute(
        current?.id,
        "label",
        `${graph.getNodeAttribute(current.id, "label")} (${startCase(
          highlightEdges.type,
        )})`,
      );
    }

    if (
      highlightEdges?.type === "backtracking" &&
      Array.isArray(highlightEdges.path)
    ) {
      let prev =
        trace?.events?.[highlightEdges?.path?.[highlightEdges?.path.length - 1]]
          ?.id;

      forEachRight(highlightEdges.path, (stepIdx) => {
        const node = trace?.events?.[stepIdx].id;
        const opt = highlightNodesOptions.find(
          (t) => t.type === highlightEdges.type,
        );
        if (graph.hasNode(`${node}`)) {
          graph.setNodeAttribute(`${node}`, "color", getThemeColor(opt?.color));
          if (node !== prev) {
            const edge = makeEdgeKey(`${node}`, `${prev}`);
            if (graph.hasEdge(edge)) {
              graph.setEdgeAttribute(edge, "color", getThemeColor(opt?.color));
            }
          }
          prev = node;
        }
      });
    }

    if (
      (highlightEdges?.type === "subtree" ||
        highlightEdges?.type === "precedent") &&
      typeof highlightEdges?.path === "object" &&
      !Array.isArray(highlightEdges?.path)
    ) {
      const opt = highlightNodesOptions.find(
        (t) => t.type === highlightEdges.type,
      );
      const isSubtree = highlightEdges?.type === "subtree";

      function iterateSubtree(subtree: Subtree) {
        forOwn(subtree, (childs: Subtree, parent: string | number) => {
          const pNode = trace?.events?.[Number(parent)].id;
          if (graph.hasNode(`${pNode}`)) {
            graph.setNodeAttribute(
              `${pNode}`,
              "color",
              getThemeColor(opt?.color),
            );
          }
          forOwn(childs, (v, child) => {
            const cNode = trace?.events?.[Number(child)].id;
            if (graph.hasNode(`${cNode}`)) {
              graph.setNodeAttribute(
                `${cNode}`,
                "color",
                getThemeColor(opt?.color),
              );
              const edge = isSubtree
                ? makeEdgeKey(`${cNode}`, `${pNode}`)
                : makeEdgeKey(`${pNode}`, `${cNode}`);
              if (graph.hasEdge(edge)) {
                graph.setEdgeAttribute(
                  edge,
                  "color",
                  getThemeColor(opt?.color),
                );
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
      forEach(slice(trace?.events, 0, step + 1), (e, i) => {
        const graphId = getGraphId(i, e);
        const graphPId = getGraphPId(i, e);
        if (graph.hasNode(`${graphId}`)) {
          const s = scale(f(get(e, p)));
          graph.setNodeAttribute(`${graphId}`, "color", s);
          if (isDefined(graphPId) && graph.hasNode(`${graphPId}`)) {
            const a = makeEdgeKey(`${graphId}`, `${graphPId}`);
            if (graph.hasDirectedEdge(a)) {
              graph.setEdgeAttribute(a, "color", s);
            }
          }
        }
      });
    }

    return { graph, graphKey: step };
  }, [
    getGraphId,
    getGraphPId,
    graph,
    step,
    trace,
    showAllEdges,
    highlightEdges,
    trackedProperty,
    backgroundHex,
    foregroundHex,
    theme,
  ]);
}
