import { useTheme } from "@mui/material";
import { SigmaContainer, useSigma } from "@react-sigma/core";
import { EdgeCurvedArrowProgram } from "@sigma/edge-curve";
import { ComponentProps, useEffect, useMemo } from "react";
import { EdgeArrowProgram } from "sigma/rendering";
import { AxisBounds } from ".";
import { getGraphColorHex } from "./useGraphColoring";

export function useGraphSettings() {
  const theme = useTheme();
  return useMemo(
    () =>
    ({
      stagePadding: 8 * 8,
      allowInvalidContainer: true,
      edgeLabelColor: { color: theme.palette.text.secondary },
      labelFont: "Inter",
      labelSize: 14,
      labelDensity: 0.1,
      renderEdgeLabels: true,
      edgeLabelFont: "Inter",
      edgeLabelSize: 12,
      defaultDrawNodeHover: () => { },
      labelColor: { color: theme.palette.text.primary },
      edgeLabelWeight: "500",
      defaultEdgeType: "arrow",
      edgeProgramClasses: {
        straight: EdgeArrowProgram,
        curvedArrow: EdgeCurvedArrowProgram,
      },
    } as ComponentProps<typeof SigmaContainer>["settings"]),
    [theme]
  );
}

export function useNodeCulling(stableAxisBounds?: AxisBounds | null) {
  const sigma = useSigma();
  const theme = useTheme();

  useEffect(() => {
    const graph = sigma?.getGraph();
    if (!graph) return;

    const backgroundHex = theme.palette.background.paper;
    const foregroundHex = theme.palette.text.primary;

    if (!stableAxisBounds) {
      return;
    }

    const { xMin, xMax, yMin, yMax } = stableAxisBounds;

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const actualXMin = xMin + (xRange * 0.048);
    const actualYMin = yMin + (yRange * 0.048);

    graph.forEachNode((node, attrs) => {
      const insideX = attrs.x >= actualXMin && attrs.x <= xMax;
      const insideY = attrs.y >= actualYMin && attrs.y <= yMax;
      const isInside = insideX && insideY;

      if (!isInside) {
        if (!attrs.storedColor) {
          graph.setNodeAttribute(node, 'storedColor', attrs.color);
        }
        const grayColor = getGraphColorHex(
          attrs.eventType || "neutral",
          0.15,
          backgroundHex,
          foregroundHex
        );
        graph.setNodeAttribute(node, 'color', grayColor);
      } else {
        if (attrs.storedColor) {
          graph.setNodeAttribute(node, 'color', attrs.storedColor);
          graph.setNodeAttribute(node, 'storedColor', undefined);
        }
      }
    });

    sigma.refresh();
  }, [sigma, stableAxisBounds, theme]);
}