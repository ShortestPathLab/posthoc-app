import {
  CompiledD2IntrinsicComponent as CompiledD2Component,
  D2InstrinsicComponents as D2Components,
} from "./D2IntrinsicComponents";
import { Transform, primitives } from "./primitives";

const ComponentUndefinedError = (c: CompiledD2Component) =>
  new Error(`The component ${c.$} is not supported by this renderer.`);

export function drawPrimitive(
  type: string,
  component: CompiledD2Component<any>,
  g: OffscreenCanvasRenderingContext2D,
  t: Transform
) {
  if (type in primitives) {
    primitives[type].draw(component, g, t);
  } else throw ComponentUndefinedError(component);
}

export const draw = <T extends keyof D2Components>(
  c: CompiledD2Component<T>,
  g: OffscreenCanvasRenderingContext2D,
  t: Transform
) => {
  drawPrimitive(c.$, c, g, t);
  drawPrimitive("text", c, g, t);
};
