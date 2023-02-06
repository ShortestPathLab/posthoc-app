import { Stage } from "@inlet/react-pixi";
import { LazyNodeList } from "components/renderer/raster/NodeList";
import { Viewport } from "./Viewport";

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
  {children, width, height}:PixiStageProps
) {

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