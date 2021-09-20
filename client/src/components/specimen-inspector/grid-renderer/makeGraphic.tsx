import { Graphics } from "@inlet/react-pixi";
import { ComponentProps } from "react";
import { Graphics as PIXIGraphics } from "@pixi/graphics";

export function makeGraphic<T = any>(
  draw: (g: PIXIGraphics, props: ComponentProps<typeof Graphics> & T) => void
) {
  return (props: ComponentProps<typeof Graphics> & T) => {
    return <Graphics {...props} draw={(g) => draw(g, props)} />;
  };
}
