import { createElement, useMemo } from "react";
import { Box, Fade } from "@material-ui/core";
import AutoSize from "react-virtualized-auto-sizer";
import { Canvas } from "../renderer/types";
import { LazyNodeList } from "./generic/NodeList";
import { View } from "protocol/Renderer";

import { PixiStage } from "./pixi/PixiStage";
import { get } from "lodash";

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
      {(size: any) => (
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
