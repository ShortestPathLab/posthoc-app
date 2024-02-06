import { createElement } from "react";
import { Layer } from "slices/layers";
import { layerHandlers } from "./layerHandlers";

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
        createElement(layerHandlers[layer?.source?.type ?? ""]?.renderer, {
          layer,
          index,
        })}
    </>
  );
}
