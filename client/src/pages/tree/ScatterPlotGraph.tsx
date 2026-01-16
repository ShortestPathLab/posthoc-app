import { useLoadGraph } from "@react-sigma/core";
import { MultiDirectedGraph } from "graphology";
import { isEmpty } from "lodash-es";
import { TraceEvent } from "protocol/Trace-v140";
import { useEffect, useMemo, useRef } from "react";
import AxisOverlay, {
  createScatterScale,
  createSymlogScatterScale,
} from "./Axis";
import { SharedGraphProps } from "./SharedGraphProps";
import { TreeControls } from "./TreeGraph";
import { getScatterPlotUniqueId, useComputePlot } from "./useComputePlot";
import { useGraphColoring } from "./useGraphColoring";
import { useHighlighting } from "./useHighlighting";

const getScatterPlotGraphId = (step: number, event: TraceEvent): string =>
  getScatterPlotUniqueId(event.id, step);
const getScatterPlotGraphPId = (step: number, event: TraceEvent): string =>
  getScatterPlotUniqueId(event.pId, step);

export function ScatterPlotGraph({
  width = 1,
  height = 1,
  logAxis,
  eventTypeFilter,
  step,
  trackedProperty,
  trace,
  layer,
  traceKey,
  xMetric,
  yMetric,
}: ScatterPlotGraphProps & SharedGraphProps) {
  const { data: plot } = useComputePlot({
    key: traceKey,
    trace: trace,
    xAxis: xMetric,
    yAxis: yMetric,
  });

  const highlightEdges = useHighlighting(layer);
  const isHighlightingEnabled = !isEmpty(highlightEdges);

  const stepBucketsRef = useRef<string[][]>([]);
  const prevStepRef = useRef<number | null>(null);

  // The graying out logic when the node is out of bounds
  // useNodeCulling(axisBounds);
  const load = useLoadGraph();
  // Initial Graph load
  const graph = useMemo(() => {
    const graph = new MultiDirectedGraph();

    stepBucketsRef.current = [];
    prevStepRef.current = null;

    const points = eventTypeFilter
      ? plot?.data?.filter?.((p) => p.point.eventType === eventTypeFilter)
      : plot?.data;

    const xScale = (logAxis.x ? createSymlogScatterScale : createScatterScale)(
      plot?.xMin ?? 0,
      plot?.xMax ?? 0,
    ).range([-1, 1]);

    const yScale = (logAxis.y ? createSymlogScatterScale : createScatterScale)(
      plot?.yMin ?? 0,
      plot?.yMax ?? 0,
    ).range([-1, 1]);

    for (const p of points ?? []) {
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

    return graph;
  }, [plot, logAxis, eventTypeFilter]);

  useGraphColoring(
    graph,
    { showAllEdges: false, trackedProperty, trace, step },
    highlightEdges,
    getScatterPlotGraphId,
    getScatterPlotGraphPId,
  );

  useEffect(() => {
    load(graph);
  }, [load, graph]);

  return (
    <>
      {!!plot && (
        <AxisOverlay
          processedData={plot}
          width={width}
          height={height}
          logAxis={logAxis}
        />
      )}
      <TreeControls
        layer={layer}
        isHighlightingEnabled={isHighlightingEnabled}
      />
    </>
  );
}
export type ScatterPlotGraphProps = {
  xMetric: string;
  yMetric: string;
  logAxis: { x: boolean; y: boolean };
  eventTypeFilter?: string;
};
