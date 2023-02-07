import { Stage } from "@inlet/react-pixi";
import { Event, Views } from "components/render/types/render";
import { LazyNodeList } from "components/renderer/raster/NodeList";
import memoizee from "memoizee";
import {d2InstrinsicComponents, DrawingInstruction} from "./NewPixiPrimitives"
import { Viewport } from "../Viewport";
import { TraceView } from "components/render/types/trace";
import { useCallback } from "react";


export type PixiStageProps = {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}





/**
 * 
 * @param props Stage properties
 * @param props.children
 * @param props.width
 * @param props.height
 * @returns 
 */
export function PixiStage(
  { children, width, height }: PixiStageProps, view:TraceView
) {

  // process all the parsed components into drawing instructions 
  const viewComps = view.components
  const drawingInstructions:{[key:string]:DrawingInstruction} = {};
  for (const compName in viewComps){
    const component = viewComps[compName as keyof object]
    drawingInstructions[compName] = d2InstrinsicComponents[component.$].converter(component)
  }

  // primitive mode of memoizee should work for memoizing of drawing instructions (this will be done in the NewPixiPrimitives.tsx file I believe)

  // create an add function that adds the graphic to a canvas and then returns a remove function

  const reference = useCallback(
    ()=>({
      add:()=>{}
    }), []
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
        {children}
      </Viewport>
    </Stage>
  </>
}