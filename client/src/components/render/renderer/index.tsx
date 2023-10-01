import { Box, Fade } from "@mui/material";
import { get } from "lodash";
import { View } from "protocol/Render";
import AutoSize from "react-virtualized-auto-sizer";
import { createElement, useMemo } from "react";
import { PixiStage } from "./pixi/PixiStage";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { Canvas } from "components/render/renderer/types";

export const Stages = {
  "2d-pixi": PixiStage,
};

type TraceViewProps = {
  view?: View;
  viewName?: string;
};

export function TraceView({ view, viewName }: TraceViewProps) {
  const Stage = useMemo(() => {
    const name = view?.renderer;
    if (!name) {
      throw new Error(`No renderer was specified`);
    }
    if (name in Stages) {
      return get(Stages, name);
    } else {
      throw new Error(`Renderer ${name} is not installed`);
    }
  }, [view, viewName]);

  return (
    <AutoSize>
      {(size) => (
        <Fade appear in>
          <Box>
            {createElement(Stage, {
              ...size,
              view,
              viewName,
              children: (canvas: Canvas) => <LazyNodeList canvas={canvas} />,
            })}
          </Box>
        </Fade>
      )}
    </AutoSize>
  );
}