import { createElement } from "react";
import { Layer } from "slices/layers";
import { getController } from "./layerControllers";

export function RenderLayer({
  layer,
  index,
}: {
  layer?: Layer;
  index?: number;
}) {
  return (
    <>
      {layer &&
        createElement(getController(layer)?.renderer, {
          layer,
          index,
        })}
    </>
  );
}
