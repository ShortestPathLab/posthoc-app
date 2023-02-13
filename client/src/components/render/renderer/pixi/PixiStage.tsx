import * as PIXI from 'pixi.js';
import * as React from "react";
import { Stage } from "@inlet/react-pixi";

import { Event, View } from "components/render/types/render";
import { Viewport } from "./Viewport";
import { d2InstrinsicComponents, DrawInstruction} from "./PixiPrimitives"
import { StageChild } from '../types';
import { PixiViewport } from './PixiViewport';

import memoizee from 'memoizee';
import { useMemo } from 'react';

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
  const viewport = React.useRef<PixiViewport>(null);

  // process all the parsed components into drawing instructions 
  const drawInstructs:DrawInstructions = useMemo(() => {
    if (!view) {
      throw new Error("No view is present in PixiStageProps");
    }
    const viewComps = view.components;
    const drawInstructions:DrawInstructions = {};
    for (const compName in viewComps){
      const component = viewComps[compName as keyof object]
      drawInstructions[compName] = memoizee(d2InstrinsicComponents[component.$].converter(component), {
        normalizer: JSON.stringify
      })
    }
    return drawInstructions;
  }, [view])

  // a function which takes in an Event List creates a graphic for them
  const makeGraphic = React.useCallback((events:Event[])=>{
    // loops through all the events and the drawing instructions
    // adding them all to the PIXI graphic
    const g = new PIXI.Graphics();
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
        viewport.current?.addChild?.(graphic);
        return () => {
          viewport.current?.removeChild?.(graphic);
        }
      }
    }), [makeGraphic]
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
      <Viewport ref={viewport} width={width} height={height}/>
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
    </Stage>
  </>)
}