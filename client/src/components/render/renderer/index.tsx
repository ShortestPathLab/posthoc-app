import { createElement } from "react"; 
import { Box, Fade } from "@material-ui/core";
import AutoSize from "react-virtualized-auto-sizer";
import { Canvas } from "components/render/renderer/types";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { Interlang } from "slices/specimen";
import { Event, Nodes } from "../types/render";

import { PixiStage } from "./pixi/PixiStage"
import { get } from "lodash";

export const Stages = {
  "2d-pixi": PixiStage
}

const getRenderer = (name: string | undefined) => {
  if (!name) {
    throw new Error(`Renderer name undefined`);
  }
  if (name in Stages) {
    return get(Stages, name);
  } else {
    throw new Error(`Renderer name ${name} not exist on platform`);
  }
}

export const createViews = (interlang: Interlang, nodes: Nodes, step: number) => {
  // interlang["other"] = {...interlang.main}
  const views:{[key: string]: React.ReactNode} = {};
   Object.keys(interlang).forEach((viewName) => {
    const Stage = getRenderer(interlang?.[viewName]?.renderer);
    views[viewName] = (
      <AutoSize>
        {(size) => (
          <Fade appear in>
            <Box>
              {createElement(Stage, {
                ...size,
                view: interlang[viewName],
                viewName,
                children: (canvas: Canvas) => (
                  <>
                    <LazyNodeList
                      canvas={canvas}
                      nodes={nodes}
                      step={step}
                    />
                  </>
                ),
              })}
            </Box>
          </Fade>
        )}
      </AutoSize>
    )
  });
  return views;
}