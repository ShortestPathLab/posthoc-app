import * as PIXI from 'pixi.js';
import { useCallback, useMemo, useRef } from "react";
import { Stage } from "@inlet/react-pixi";

import { Event, View } from "components/render/types/render";
import { Viewport } from "./Viewport";
import { d2InstrinsicComponents, DrawInstruction} from "./NewPixiPrimitives"

export type PixiStageProps = {
  width?: number;
  height?: number;
  children?: React.ReactNode;
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
  { width, height, view }: PixiStageProps
) {
  const stageRef = useRef<Stage>(null);

  // process all the parsed components into drawing instructions 
  const drawInstructs:DrawInstructions = useMemo(():DrawInstructions => {
    if (!view) {
      throw new Error("")
    }
    const viewComps = view.components;
    const drawInstructions:DrawInstructions = {};
    for (const compName in viewComps){
      const component = viewComps[compName as keyof object]
      drawInstructions[compName] = d2InstrinsicComponents[component.$].converter(component)
    }
    return drawInstructions
  }, [view])

  // a function which takes in an Event List creates a graphic for them
  const makeGraphic = useCallback((events:Event[])=>{
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
  const reference = useCallback(
    ()=>({
      add:(events:Event[])=>{
        const graphic = makeGraphic(events);
        stageRef.current.addChild(graphic)

        return () => {
          if (stageRef.current) {
            // FIXME may cause memory leak by holding the graphic reference?
            stageRef.current.removeChild(graphic);
          }
        }
      }
    }), [stageRef]
  )


  return <>
    <Stage
      ref={stageRef}
      options={{
        backgroundColor: 0xffffff,
        autoDensity: true,
        clearBeforeRender: false,
        resolution: 1,
        antialias: true,
      }}
    >
      <Viewport width={width} height={height}>
      </Viewport>
    </Stage>
  </>
}