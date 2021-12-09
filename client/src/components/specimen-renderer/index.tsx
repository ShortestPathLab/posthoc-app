import { get } from "lodash";
import { DefaultRenderer } from "./default-renderer";
import { GridRenderer } from "./grid-renderer";
import { NetworkRenderer } from "./network-renderer";
import { RendererMap } from "./Renderer";

const renderers: RendererMap = {
  grid: GridRenderer,
  json: NetworkRenderer,
  xy: NetworkRenderer,
};

export function getRenderer(key = "") {
  return get(renderers, key, DefaultRenderer);
}
