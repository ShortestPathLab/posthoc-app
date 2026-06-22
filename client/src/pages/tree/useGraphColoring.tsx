import { useTheme } from "@mui/material";
import interpolate from "color-interpolate";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import { Highlighting, highlightNodesOptions, Subtree } from "hooks/useHighlight";
import { isNumber, trimStart } from "es-toolkit";
import {
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
  truncate,
} from "es-toolkit/compat";
import memoizee from "memoizee";
import { TraceEvent } from "protocol/Trace-v140";
import { useMemo, useRef } from "react";
import { AccentColor, getShade } from "theme";
import { assert } from "utils/assert";
import { makeEdgeKey } from "./makeEdgeKey";
import { isDefined, setAttributes, SEVEN_CLASS_GNBU, TreeGraphProps } from "./TreeGraph";
import { useSigma } from "@react-sigma/core";

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

// Events fade with `strength = max(1 - (step - i) / pastSteps, floorStrength)`,
// so an event's colour stops changing once it reaches the floor — at which
// point it is `pastSteps * (1 - floorStrength)` steps behind. Only events newer
// than that ("the window") change colour between adjacent steps; everything
// older is static. The incremental path below exploits this.
const pastSteps = 400;
const floorStrength = 0.3;
const fadeWindow = Math.ceil(pastSteps * (1 - floorStrength));

export function useGraphColoring(
  graph: MultiDirectedGraph,
  { showAllEdges, trackedProperty, trace, step: stepProp }: TreeGraphProps,
  highlightEdges?: Highlighting,
  getGraphId = defaultGetGraphId,
  getGraphPId = defaultGetGraphPId,
) {
  "use no memo";
  // This hook modifies `graph`, which is against the rules of React.
  // TODO: fix this in the future.
  const step = stepProp ?? 0;
  const theme = useTheme();

  const backgroundHex = theme.palette.background.paper;
  const foregroundHex = theme.palette.text.primary;

  const sigma = useSigma();

  // Min/max of the tracked property doesn't depend on `step`; hoist it out of
  // the per-step path so playback doesn't rescan every event each frame.
  const trackedRange = useMemo(() => {
    if (!trackedProperty) return null;
    const p = trimStart(trackedProperty, ".");
    return {
      p,
      minVal: min(map(trace?.events, (e) => get(e, p))),
      maxVal: max(map(trace?.events, (e) => get(e, p))),
    };
  }, [trackedProperty, trace]);

  // Tracks the inputs of the last applied colouring so we can decide whether the
  // next update can be an incremental window recolour or needs a full rebuild.
  const last = useRef<{
    graph?: MultiDirectedGraph;
    trace?: TreeGraphProps["trace"];
    showAllEdges?: boolean;
    highlightEdges?: Highlighting;
    trackedRange?: typeof trackedRange;
    backgroundHex?: string;
    foregroundHex?: string;
    getGraphId?: typeof getGraphId;
    getGraphPId?: typeof getGraphPId;
    theme?: typeof theme;
    step: number;
  }>({ step: -1 });

  return useMemo(() => {
    const isHighlightEdges = !isEmpty(highlightEdges);

    // Neutral base color for un-visited nodes/edges
    const neutralColor = getGraphColorHex(
      "neutral", // event type doesn’t matter when strength === 0
      0,
      backgroundHex,
      foregroundHex,
    );

    // Colour the events in the absolute index range [lo, hi]. Mirrors the
    // original walk: forward (last-write-wins) when showing all edges, otherwise
    // reverse with first-occurrence-wins dedup so the most recent visit owns a
    // node/edge.
    const colorRange = (lo: number, hi: number) => {
      const events = trace?.events;
      if (!events) return;
      const isSetNode: Record<string, boolean> = {};
      const isSet: Record<string, boolean> = {};

      const apply = (i: number) => {
        const event = events[i];
        if (!event) return;
        const { type } = event;
        const graphId = getGraphId(i, event);
        const graphPId = getGraphPId(i, event);
        const strength = isHighlightEdges
          ? 0.1
          : Math.max(1 - (step - i) / pastSteps, floorStrength);

        const finalColor = getGraphColorHex(type!, strength, backgroundHex, foregroundHex);

        if (graph.hasNode(`${graphId}`) && !isSetNode[graphId]) {
          setAttributes(graph, `${graphId}`, "node", {
            zIndex: 1 + i,
            color: finalColor,
            label: truncate(`${startCase(type)} ${graphId}`, { length: 50 }),
            forceLabel: step === i,
          });

          const a = makeEdgeKey(graphId, graphPId);
          if (isDefined(graphPId) && graph.hasNode(`${graphPId}`) && graph.hasEdge(a) && !isSet[a]) {
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
      };

      if (showAllEdges) {
        for (let i = lo; i <= hi; i++) apply(i);
      } else {
        for (let i = hi; i >= lo; i--) apply(i);
      }
    };

    const prev = last.current;
    const structuralChanged =
      prev.graph !== graph ||
      prev.trace !== trace ||
      prev.showAllEdges !== showAllEdges ||
      prev.highlightEdges !== highlightEdges ||
      prev.trackedRange !== trackedRange ||
      prev.backgroundHex !== backgroundHex ||
      prev.foregroundHex !== foregroundHex ||
      prev.getGraphId !== getGraphId ||
      prev.getGraphPId !== getGraphPId ||
      prev.theme !== theme;
    const delta = step - prev.step;

    // Fast path: nothing but `step` moved, by a small forward amount, and we're
    // in the plain fading mode (no highlight overlay / tracked property). Then
    // only events in [prev.step - fadeWindow, step] can have changed colour —
    // recolour just those instead of resetting and rewalking all of history.
    const canIncrement =
      !structuralChanged && !isHighlightEdges && !trackedRange && delta > 0 && delta <= fadeWindow;

    if (canIncrement) {
      colorRange(Math.max(0, prev.step - fadeWindow), step);
    } else {
      // Reset all nodes
      graph.forEachNode((v) => {
        setAttributes(graph, v, "node", {
          zIndex: 0,
          color: neutralColor,
          forceLabel: false,
          label: truncate(v, { length: 50 }),
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

      // Walk events up to current step and apply fading color
      colorRange(0, step);

      const getThemeColor = (c: AccentColor = "grey") => getShade(c, theme.palette.mode);

      if (highlightEdges && isHighlightEdges) {
        assert(isNumber(highlightEdges?.step), "No step");
        const node = trace?.events?.[highlightEdges.step];
        assert(node, "No current event");
        const graphId = getGraphId(highlightEdges.step, node);
        if (graph.hasNode(graphId)) {
          graph.setNodeAttribute(graphId, "forceLabel", "true");
          graph.setNodeAttribute(
            graphId,
            "label",
            `${graph.getNodeAttribute(graphId, "label")} (${startCase(highlightEdges.type)})`,
          );
        }
      }

      if (highlightEdges?.type === "backtracking" && Array.isArray(highlightEdges.path)) {
        let prevId = trace?.events?.[highlightEdges?.path?.[highlightEdges?.path.length - 1]]?.id;

        forEachRight(highlightEdges.path, (stepIdx) => {
          assert(trace?.events?.[stepIdx], "No event");
          const graphId = getGraphId(stepIdx, trace.events[stepIdx]);
          const opt = highlightNodesOptions.find((t) => t.type === highlightEdges.type);
          if (graph.hasNode(`${graphId}`)) {
            graph.setNodeAttribute(`${graphId}`, "color", getThemeColor(opt?.color));
            if (graphId !== prevId) {
              const edge = makeEdgeKey(`${graphId}`, `${prevId}`);
              if (graph.hasEdge(edge)) {
                graph.setEdgeAttribute(edge, "color", getThemeColor(opt?.color));
              }
            }
            prevId = graphId;
          }
        });
      }

      if (
        (highlightEdges?.type === "subtree" || highlightEdges?.type === "precedent") &&
        typeof highlightEdges?.path === "object" &&
        !Array.isArray(highlightEdges?.path)
      ) {
        const opt = highlightNodesOptions.find((t) => t.type === highlightEdges.type);
        const isSubtree = highlightEdges?.type === "subtree";

        function iterateSubtree(subtree: Subtree) {
          forOwn(subtree, (childs: Subtree, parent: string | number) => {
            assert(trace?.events?.[Number(parent)], "No event");
            const pNode = getGraphId(Number(parent), trace.events[Number(parent)]);
            if (graph.hasNode(`${pNode}`)) {
              graph.setNodeAttribute(`${pNode}`, "color", getThemeColor(opt?.color));
            }
            forOwn(childs, (v, child) => {
              assert(trace?.events?.[Number(child)], "No event");
              const cNode = getGraphId(Number(child), trace.events[Number(child)]);
              if (graph.hasNode(`${cNode}`)) {
                graph.setNodeAttribute(`${cNode}`, "color", getThemeColor(opt?.color));
                const edge = isSubtree
                  ? makeEdgeKey(`${cNode}`, `${pNode}`)
                  : makeEdgeKey(`${pNode}`, `${cNode}`);
                if (graph.hasEdge(edge)) {
                  graph.setEdgeAttribute(edge, "color", getThemeColor(opt?.color));
                  graph.setEdgeAttribute(edge, "hidden", false);
                }
              }
            });
            iterateSubtree(childs);
          });
        }

        iterateSubtree(highlightEdges?.path);
      }

      if (trackedRange) {
        const { p, minVal, maxVal } = trackedRange;
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
    }

    last.current = {
      graph,
      trace,
      showAllEdges,
      highlightEdges,
      trackedRange,
      backgroundHex,
      foregroundHex,
      getGraphId,
      getGraphPId,
      theme,
      step,
    };

    sigma.scheduleRefresh({ layoutUnchange: true });
  }, [
    sigma,
    getGraphId,
    getGraphPId,
    graph,
    step,
    trace,
    showAllEdges,
    highlightEdges,
    trackedRange,
    backgroundHex,
    foregroundHex,
    theme,
  ]);
}
