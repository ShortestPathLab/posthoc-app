import { useTheme } from "@mui/material";
import { useSigma, useLoadGraph } from "@react-sigma/core";
import { MultiDirectedGraph } from "graphology";
import { useRef, useEffect } from "react";
import { ScatterPlotGraphProps } from ".";
import { createSymlogScatterScale, createScatterScale } from "./Axis";
import { getGraphColorHex } from "./useGraphColoring";
import { useNodeCulling } from "./useGraphSettings";

export function ScatterPlotGraph({
  processedData,
  logAxis,
  eventTypeFilter,
  step,
  axisBounds,
}: ScatterPlotGraphProps) {
  const theme = useTheme();
  const sigma = useSigma();
  const loadGraph = useLoadGraph();

  const backgroundHex = theme.palette.background.paper;
  const foregroundHex = theme.palette.text.primary;

  const stepBucketsRef = useRef<string[][]>([]);
  const prevStepRef = useRef<number | null>(null);
  const baseColorByIdRef = useRef<Record<string, string>>({});

  // The graying out logic when the node is out of bounds
  useNodeCulling(axisBounds);

  // Initial Graph load
  useEffect(() => {
    const graph = new MultiDirectedGraph();

    stepBucketsRef.current = [];
    baseColorByIdRef.current = {};
    prevStepRef.current = null;

    const neutralColor = getGraphColorHex(
      "neutral",
      0,
      backgroundHex,
      foregroundHex,
    );

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

      const baseColor = getGraphColorHex(
        p.point.eventType,
        1,
        backgroundHex,
        foregroundHex,
      );

      baseColorByIdRef.current[id] = baseColor;
      (stepBucketsRef.current[s] ??= []).push(id);

      graph.addNode(id, {
        x: xScale(p.x),
        y: yScale(p.y),
        size: 3,
        label: p.point.label,
        color: neutralColor,
        originalColor: baseColor,
        logicalId: p.point.logicalId,
        step: s,
        eventType: p.point.eventType,
      });
    }

    loadGraph(graph);
  }, [
    loadGraph,
    processedData,
    logAxis,
    eventTypeFilter,
    backgroundHex,
    foregroundHex,
  ]);

  // Graph color update on step change
  useEffect(() => {
    const graph = sigma.getGraph();
    if (!graph) return;

    const buckets = stepBucketsRef.current;
    const baseColorById = baseColorByIdRef.current;

    const neutralColor = getGraphColorHex(
      "neutral",
      0,
      backgroundHex,
      foregroundHex,
    );

    const next = step ?? 0;
    const prev = prevStepRef.current;

    // First run → replay 0..step once
    if (prev == null) {
      for (let s = 0; s <= next; s++) {
        const ids = buckets[s];
        if (!ids) continue;
        for (const id of ids) {
          const color = baseColorById[id];
          graph.setNodeAttribute(id, "color", color);
        }
      }
    } else if (next > prev) {
      // forward
      for (let s = prev + 1; s <= next; s++) {
        const ids = buckets[s];
        if (!ids) continue;
        for (const id of ids) {
          const color = baseColorById[id];
          graph.setNodeAttribute(id, "color", color);
        }
      }
    } else if (next < prev) {
      // backward
      for (let s = next + 1; s <= prev; s++) {
        const ids = buckets[s];
        if (!ids) continue;
        for (const id of ids) {
          graph.setNodeAttribute(id, "color", neutralColor);
        }
      }
    }

    // Size changes for current step
    if (prev != null && buckets[prev]) {
      for (const id of buckets[prev]) {
        graph.setNodeAttribute(id, "size", 3);
      }
    }
    if (buckets[next]) {
      for (const id of buckets[next]) {
        graph.setNodeAttribute(id, "size", 12);
      }
    }

    prevStepRef.current = next;
    sigma.refresh();
  }, [sigma, step, backgroundHex, foregroundHex]);

  return null;
}
