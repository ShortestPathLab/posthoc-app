import { createElement } from "react"; 
import { Box, Fade, LinearProgress } from "@material-ui/core";
import AutoSize from "react-virtualized-auto-sizer";
import { UseCanvas } from "components/render/renderer/types";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { Interlang } from "slices/interlang";

import traceJson from "../data/tile.trace.json";
// import traceJson from "../render/data/tile.trace.json";
// import traceJson from ".../render/road-astar.trace.json";


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

export function createViews(interlang: Interlang) {
  
  const views = Object.keys(interlang).map((viewName) => {
    const Stage = getRenderer(interlang?.[viewName]?.renderer);
    
    return (
      <AutoSize>
        {(size) => (
          <Fade appear in>
            <Box>
              {createElement(Stage, {
                ...size,
                view: interlang.main,
                children: (useCanvas: UseCanvas) => (
                  <>
                    <LazyNodeList
                      useCanvas={useCanvas}
                      events={traceJson.eventList}
                      step={100}
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