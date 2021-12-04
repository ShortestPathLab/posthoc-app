import { get } from "lodash";
import { BaseRasterRenderer } from "./base-raster-renderer/BaseRasterRenderer";
import { DefaultRenderer } from "./default-renderer/DefaultRenderer";
import { GridRenderer } from "./grid-renderer/GridRenderer";
import { NetworkRenderer } from "./network-renderer/NetworkRenderer";
import { RendererMap } from "./Renderer";

const renderers: RendererMap = {
  grid: GridRenderer,
  json: BaseRasterRenderer,
  xy: NetworkRenderer,
};

export function getRenderer(key = "") {
  return get(renderers, key, DefaultRenderer);
}
