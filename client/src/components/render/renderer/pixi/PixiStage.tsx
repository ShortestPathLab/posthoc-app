import * as PIXI from 'pixi.js';
import * as React from "react";
import { AppProvider, Stage, useApp } from "@inlet/react-pixi";

import { Event, View } from "components/render/types/render";
import { Viewport } from "./Viewport";
import { d2InstrinsicComponents, DrawInstruction} from "./NewPixiPrimitives"
import { StageChild } from '../types';

export type PixiStageProps = {
  width?: number;
  height?: number;
  children?: StageChild;
  view?: View;
}

export type DrawInstructions = {
  [key:string]:DrawInstruction
}


/**
 * PIXI Stage component for rendering view and search trace,
 * view must be composed of following supported primitives
 * - rect (Rectangle)
 * - circle
 * - path
 * - polygon
 * @param props Stage properties
 * @param props.width Width of the allocated view space
 * @param props.height Height of the allocated view space
 * @param props.view {View} View definition from Intermediate Language
 * @returns Pixi Stage element that renders current view
 */


export function PixiStage(
  { width, height, view, children }: PixiStageProps
) {
  // get the PIXI.Application instance which holds the Stage object
  const app = useApp();

  // process all the parsed components into drawing instructions 
  const drawInstructs:DrawInstructions = React.useMemo(():DrawInstructions => {
    if (!view) {
      throw new Error("No view is present in PixiStageProps");
    }
    const viewComps = view.components;
    const drawInstructions:DrawInstructions = {};
    for (const compName in viewComps){
      const component = viewComps[compName as keyof object]
      drawInstructions[compName] = d2InstrinsicComponents[component.$].converter(component)
    }
    return drawInstructions;
  }, [view])

  // a function which takes in an Event List creates a graphic for them
  const makeGraphic = React.useCallback((events:Event[])=>{
    const g = new PIXI.Graphics();
    // loops through all the events and the drawing instructions
    // adding them all to the PIXI graphic
    for (const event of events){
      for (const compName in drawInstructs){
        drawInstructs[compName](event)(g);
      }
    }
    return g;
  }, [drawInstructs]);

  // create an add function that adds the graphic to a canvas and then returns a remove function
  const useCanvas = React.useCallback(
    ()=>({
      add:(events:Event[])=>{
        const graphic = makeGraphic(events);
        app.stage.addChild(graphic);

        return () => {
          app.stage.removeChild(graphic);
        }
      }
    }), [app, makeGraphic]
  )


  return (<>
    <Stage
      width={width} height={height}
      options={{
        backgroundColor: 0xffffff,
        autoDensity: true,
        clearBeforeRender: false,
        resolution: 1,
        antialias: true,
      }}
    >
      <Viewport width={width} height={height}>
        {
          /**
           * Children will be a callback that returns child components 
           * wrapped in Fragment and binded with useCanvas prop
           * (useCanvas) => (
           *  <React.Fragment>
           *    <LazyNodeList useCanvas={useCanvas} />
           *  </React.Fragment>
           * )
           */
          children?.(useCanvas)
        }
      </Viewport>
    </Stage>
  </>)
}