import { createElement, useMemo } from "react"; 
import { Box, Fade } from "@material-ui/core";
import AutoSize from "react-virtualized-auto-sizer";
import { Canvas } from "components/render/renderer/types";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { View } from "protocol/Render";

import { PixiStage } from "./pixi/PixiStage"
import { get } from "lodash";

export const Stages = {
  "2d-pixi": PixiStage
}

export function TraceView({view, viewName}: {view?: View, viewName?: string}) {
  const Stage = useMemo(() => {
    const name = view?.renderer;
    if (!name) {
      throw new Error(`Renderer name undefined`);
    }
    if (name in Stages) {
      return get(Stages, name);
    } else {
      throw new Error(`Renderer name ${name} not exist on platform`);
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
              children: (canvas: Canvas) => (
                <>
                  <LazyNodeList
                    canvas={canvas}
                  />
                </>
              ),
            })}
          </Box>
        </Fade>
      )}
    </AutoSize>
  )
}