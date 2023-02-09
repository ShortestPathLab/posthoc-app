import { Stage } from "@inlet/react-pixi";
import { Event } from "components/render/types/render";
import {d2InstrinsicComponents, DrawingInstruction} from "./NewPixiPrimitives"
import { Viewport } from "./Viewport";
import { TraceView } from "components/render/types/trace";
import { useCallback } from "react";
import memoizee from "memoizee";
import * as PIXI from 'pixi.js';

export type PixiStageProps = {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

/**
 * @param props Stage properties
 * @param props.width
 * @param props.height
 * @returns 
 */
export function PixiStage(
  { width, height }: PixiStageProps, view:TraceView
) {

  // process all the parsed components into drawing instructions 
  const viewComps = view.components
  const drawingInstructions:{[key:string]:DrawingInstruction} = {};
  for (const compName in viewComps){
    const component = viewComps[compName as keyof object]
    drawingInstructions[compName] = d2InstrinsicComponents[component.$].converter(component)
  }

  // a function which takes in an Event List creates a graphic for them
  const makeGraphic = memoizee((events:Event[])=>{
    const graphic = new PIXI.Graphics();

    // loops through all the events and the drawing instructions
    // adding them all to the PIXI graphic
    for (const event of events){
      for (const drawIntr in drawingInstructions){
        drawingInstructions[drawIntr](event)(graphic)
      }
    }
    return graphic
  })

  // create an add function that adds the graphic to a canvas and then returns a remove function
  const canvasRef = new PIXI.Graphics();

  const reference = useCallback(
    ()=>({
      add:(events:Event[])=>{
        const graphic = makeGraphic(events);
        canvasRef.addChild(graphic)

        return () => {
          canvasRef.removeChild(graphic)
        }
      }
    }), [canvasRef]
  )


  return <>
    <Stage
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