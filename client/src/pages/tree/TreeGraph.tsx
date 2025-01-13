import {
  CenterFocusWeakOutlined,
  FlipCameraAndroidOutlined as RotateIcon,
  ExitToAppFilledOutlined,
} from "@mui-symbols-material/w300";
import {
  Box,
  Divider,
  ListItem,
  Stack,
  SxProps,
  Theme,
  useTheme,
} from "@mui/material";
import { useSigma } from "@react-sigma/core";
import {
  MinimisedPlaybackControls,
  PlaybackLayerData,
} from "components/app-bar/Playback";
import { IconButtonWithTooltip } from "components/generic/IconButtonWithTooltip";
import { MultiDirectedGraph } from "graphology";
import { HighlightLayerData, highlightNodesOptions } from "hooks/useHighlight";
import { forOwn, isEmpty, isNull, isUndefined } from "lodash";
import { Trace } from "protocol";
import { useEffect, useState } from "react";
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

  const isHighlightEdges = !isEmpty(highlightEdges);

  const highlightingViewBgColor = getShade(
    highlightNodesOptions.find(
      (highlight) => highlight.type === highlightEdges?.type
    )?.color,
    theme.palette.mode,
    500,
    400
  );

  return (
    <Stack
      sx={{
        pt: 6,
        position: "absolute",
        top: 0,
        left: 0,
        minWidth: isHighlightEdges ? 1 : "auto",
      }}
    >
      {isHighlightEdges && (
        <Box
          sx={{
            bgcolor: highlightingViewBgColor || "info.main",
            boxShadow: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <ListItem />
          <ListItem> {highlightEdges?.type}</ListItem>
          <IconButtonWithTooltip
            label="exit"
            icon={<ExitToAppFilledOutlined />}
            onClick={onExit}
          />
        </Box>
      )}
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
  );
}
