import { createElement } from "react"; 
import { Box, Fade } from "@material-ui/core";
import AutoSize from "react-virtualized-auto-sizer";
import { Canvas } from "components/render/renderer/types";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { Interlang } from "slices/specimen";
import { Event } from "../types/render";

import { PixiStage } from "./pixi/PixiStage"
import { get } from "lodash";
import { ViewData } from "components/inspector/SplitView";

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

export const createViews = (interlang: Interlang, eventList: Event[], step: number) => {
  
  const views = Object.keys(interlang).map((viewName) => {
    const Stage = getRenderer(interlang?.[viewName]?.renderer);
    
    return (viewData:ViewData, setViewData:(data:ViewData)=>void) => (
      <AutoSize>
        {(size) => (
          <Fade appear in>
            <Box>
              {createElement(Stage, {
                ...size,
                view: interlang[viewName],
                viewData,
                setViewData,
                children: (canvas: Canvas) => (
                  <>
                    <LazyNodeList
                      canvas={canvas}
                      events={eventList}
                      step={step}
                      persist={interlang[viewName]?.persist}
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
  views.push(views[0])
  return views;
}