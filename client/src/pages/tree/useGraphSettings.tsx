import { useTheme } from "@mui/material";
import { SigmaContainer } from "@react-sigma/core";
import { EdgeCurvedArrowProgram } from "@sigma/edge-curve";
import { ComponentProps, useMemo } from "react";
import { EdgeArrowProgram } from "sigma/rendering";

export function useGraphSettings() {
  const theme = useTheme();
  return useMemo(
    () =>
      ({
        zIndex: true,
        stagePadding: 8 * 8,
        allowInvalidContainer: true,
        edgeLabelColor: { color: theme.palette.text.secondary },
        labelFont: "Inter",
        labelSize: 14,
        labelDensity: 0.1,
        renderEdgeLabels: true,
        edgeLabelFont: "Inter",
        edgeLabelSize: 12,
        defaultDrawNodeHover: () => {},
        labelColor: { color: theme.palette.text.primary },
        edgeLabelWeight: "500",
        defaultEdgeType: "arrow",
        edgeProgramClasses: {
          straight: EdgeArrowProgram,
          curvedArrow: EdgeCurvedArrowProgram,
        },
      }) as ComponentProps<typeof SigmaContainer>["settings"],
    [theme],
  );
}
