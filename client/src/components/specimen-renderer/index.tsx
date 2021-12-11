import { get } from "lodash";
import { DefaultRenderer } from "./default-renderer";
import { GridRenderer } from "./grid-renderer";
import { MeshRenderer } from "./mesh-renderer";
import { NetworkRenderer } from "./network-renderer";
import { RendererMap } from "./Renderer";

const renderers: RendererMap = {
  grid: GridRenderer,
  xy: NetworkRenderer,
  mesh: MeshRenderer,
};

export function getRenderer(key = "") {
  return get(renderers, key, DefaultRenderer);
}
