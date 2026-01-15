import { useLoadGraph } from "@react-sigma/core";
import { MultiDirectedGraph } from "graphology";
import { useEffect, useMemo, useRef } from "react";
import { ScatterPlotGraphProps } from ".";
import AxisOverlay, {
  createScatterScale,
  createSymlogScatterScale,
} from "./Axis";
import { getScatterPlotUniqueId } from "./buildScatterPlotData";
import { useGraphColoring } from "./useGraphColoring";
import { useHighlighting } from "./useHighlighting";
import { TraceEvent } from "protocol/Trace-v140";
import { SharedGraphProps } from "./SharedGraphProps";
import { TreeControls } from "./TreeGraph";
import { isEmpty } from "lodash-es";

const getScatterPlotGraphId = (step: number, event: TraceEvent): string =>
  getScatterPlotUniqueId(event.id, step);
const getScatterPlotGraphPId = (step: number, event: TraceEvent): string =>
  getScatterPlotUniqueId(event.pId, step);

export function ScatterPlotGraph({
  width = 1,
  height = 1,
  processedData,
  logAxis,
  eventTypeFilter,
  step,
  trackedProperty,
  trace,
  layer,
}: ScatterPlotGraphProps & SharedGraphProps) {
  "use no memo";
  const highlightEdges = useHighlighting(layer);
  const isHighlightingEnabled = !isEmpty(highlightEdges);

  const stepBucketsRef = useRef<string[][]>([]);
  const prevStepRef = useRef<number | null>(null);

  // The graying out logic when the node is out of bounds
  // useNodeCulling(axisBounds);
  const load = useLoadGraph();
  // Initial Graph load
  const { graph: baseGraph, load: loadGraph } = useMemo(() => {
    const graph = new MultiDirectedGraph();

    stepBucketsRef.current = [];
    prevStepRef.current = null;

    const points = eventTypeFilter
      ? processedData.data.filter((p) => p.point.eventType === eventTypeFilter)
      : processedData.data;

    const xScale = (logAxis.x ? createSymlogScatterScale : createScatterScale)(
      processedData.xMin,
      processedData.xMax,
    ).range([-1, 1]);

    const yScale = (logAxis.y ? createSymlogScatterScale : createScatterScale)(
      processedData.yMin,
      processedData.yMax,
    ).range([-1, 1]);

    for (const p of points) {
      const id = p.point.id;
      const s = p.point.step;

      (stepBucketsRef.current[s] ??= []).push(id);

      graph.addNode(id, {
        x: xScale(p.x),
        y: yScale(p.y),
        size: 3,
        label: p.point.label,
        logicalId: p.point.logicalId,
        step: s,
        eventType: p.point.eventType,
      });
    }

    return { graph, load };
  }, [load, processedData, logAxis, eventTypeFilter]);

  const { graph, graphKey } = useGraphColoring(
    baseGraph,
    { showAllEdges: false, trackedProperty, trace, step },
    highlightEdges,
    getScatterPlotGraphId,
    getScatterPlotGraphPId,
  );
  useEffect(() => {
    loadGraph(graph);
  }, [loadGraph, graph, graphKey, trackedProperty, step]); // TODO Fix extra deps

  return (
    <>
      <AxisOverlay
        processedData={processedData}
        width={width}
        height={height}
        logAxis={logAxis}
      />
      <TreeControls
        layer={layer}
        isHighlightingEnabled={isHighlightingEnabled}
      />
    </>
  );
}
