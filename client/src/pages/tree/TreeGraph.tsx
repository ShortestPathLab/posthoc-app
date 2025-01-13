import {
  CenterFocusWeakOutlined,
  FiberManualRecordFilledOutlined as FiberManualRecord,
  FlipCameraAndroidOutlined as RotateIcon,
} from "@mui-symbols-material/w300";
import {
  alpha,
  Box,
  Divider,
  Stack,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useSigma } from "@react-sigma/core";
import {
  MinimisedPlaybackControls,
  PlaybackLayerData,
} from "components/app-bar/Playback";
import { Button } from "components/generic/Button";
import { IconButtonWithTooltip } from "components/generic/IconButtonWithTooltip";
import { Scroll } from "components/generic/Scrollbars";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import { HighlightLayerData, highlightNodesOptions } from "hooks/useHighlight";
import { forOwn, isEmpty, isNull, isUndefined, pick, startCase } from "lodash";
import { Trace } from "protocol";
import { ReactNode, useEffect, useState } from "react";
import { Layer } from "slices/layers";
import { getShade, useAcrylic, usePaper } from "theme";
import { TreeWorkerReturnType } from "./tree.worker";
import { useGraphColoring } from "./useGraphColoring";
import { useMultiDirectedGraph } from "./useMultiDirectedGraph";

export function setAttributes(
  graph: MultiDirectedGraph,
  id: string,
  type: "edge" | "node",
  values: { [K in string]: any }
) {
  const a = {
    node: "setNodeAttribute" as const,
    edge: "setEdgeAttribute" as const,
  }[type];
  forOwn(values, (v, k) => {
    graph[a](id, k, v);
  });
}

export const orientationOptions = {
  horizontal: {
    value: "horizontal",
  },
  vertical: {
    value: "vertical",
  },
};

export const isDefined = (a: any) => !isUndefined(a) && !isNull(a);

export const divider = (
  <Divider orientation="vertical" flexItem sx={{ m: 1 }} />
);

/**
 * @see https://colorbrewer2.org/#type=sequential&scheme=GnBu&n=9
 */
export const SEVEN_CLASS_GNBU = [
  "#ccebc5",
  "#a8ddb5",
  "#7bccc4",
  "#4eb3d3",
  "#2b8cbe",
  "#0868ac",
  "#084081",
];

function Dot({ label, color }: { label?: ReactNode; color?: string }) {
  return (
    <Tooltip title={label}>
      <FiberManualRecord
        sx={{ color, transform: "scale(0.5) translateY(10px)", mr: -0.5 }}
        fontSize="small"
      />
    </Tooltip>
  );
}

export type TreeGraphProps = {
  trace?: Trace;
  tree?: TreeWorkerReturnType;
  step?: number;
  layer?: Layer<PlaybackLayerData>;
  showAllEdges?: boolean;
  trackedProperty?: string;
  highlightEdges?: HighlightLayerData["highlighting"];
  onExit?: () => void;
};

export function TreeGraph(props: TreeGraphProps) {
  const { trace, tree, layer, highlightEdges, onExit } = props;

  const paper = usePaper();
  const acrylic = useAcrylic();
  const theme = useTheme();

  const sigma = useSigma();

  const [orientation, setOrientation] =
    useState<keyof typeof orientationOptions>("vertical");

  const { graph: baseGraph, load } = useMultiDirectedGraph(
    trace,
    tree,
    orientation
  );

  const graph = useGraphColoring(baseGraph, props);

  useEffect(() => load?.(graph.graph), [graph, load]);

  const isHighlightingEnabled = !isEmpty(highlightEdges);

  const bg = getShade(
    highlightNodesOptions.find(
      (highlight) => highlight.type === highlightEdges?.type
    )?.color,
    theme.palette.mode,
    500,
    400
  );

  const event = trace?.events?.[highlightEdges?.step ?? 0];

  return (
    <>
      <Stack
        sx={{
          pt: isHighlightingEnabled ? 11 : 6,
          transition: (t) => t.transitions.create("padding-top"),
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Stack
          direction="row"
          sx={
            {
              ...paper(1),
              ...acrylic,
              alignItems: "center",
              height: (t) => t.spacing(6),
              px: 1,
              m: 1,
            } as SxProps<Theme>
          }
        >
          <IconButtonWithTooltip
            color="primary"
            onClick={() => {
              sigma?.getCamera?.()?.animatedReset?.();
            }}
            label="Fit"
            icon={<CenterFocusWeakOutlined />}
          />
          {divider}
          <IconButtonWithTooltip
            color="primary"
            onClick={() => {
              setOrientation(
                orientation === "vertical" ? "horizontal" : "vertical"
              );
            }}
            label="Rotate"
            icon={<RotateIcon />}
          />
          {divider}
          {<MinimisedPlaybackControls layer={layer} />}
        </Stack>
      </Stack>
      <Stack
        sx={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pt: 6,
          pointerEvents: "none",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            height: "100%",
            border: isHighlightingEnabled ? `2px solid ${bg}` : "none",
            // The top bar has a 0.5px border, so the top border of the graph needs to be 0.5 pixels thicker
            borderTopWidth: "2.5px",
            transition: (t) => t.transitions.create("box-shadow"),
          }}
        >
          {isHighlightingEnabled && (
            <Scroll x style={{ height: theme.spacing(5) }}>
              <Box
                sx={{
                  ...pick(acrylic as any, "backdropFilter"),
                  transition: (t) => t.transitions.create("background-color"),
                  pointerEvents: "all",
                  alignItems: "center",
                  p: 2,
                  height: "100%",
                  bgcolor: alpha(bg, 0.05) || "info.main",
                  display: "flex",
                  justifyContent: "space-between",
                  minWidth: "max-content",
                  gap: 2,
                }}
              >
                <Typography variant="overline">
                  {startCase(highlightEdges?.type)}{" "}
                  <Box sx={{ opacity: 0.7 }} component="span">
                    <Dot color={getColorHex(event?.type)} />{" "}
                    {startCase(event?.type)} {event?.id}
                    {", "}
                    Step {highlightEdges?.step}{" "}
                  </Box>
                </Typography>
                <Button
                  onClick={onExit}
                  variant="outlined"
                  sx={{
                    mr: -1,
                    height: theme.spacing(4),
                  }}
                >
                  Exit focused view
                </Button>
              </Box>
            </Scroll>
          )}
        </Stack>
      </Stack>
    </>
  );
}
