import { get } from "lodash";
import { DefaultRenderer } from "./default-renderer/DefaultRenderer";
import { getDefaults } from "./default-renderer/getDefaults";
import { getDefaults as getGridDefaults } from "./grid-renderer/getDefaults";
import { GridRenderer } from "./grid-renderer/GridRenderer";
import { RendererEntry, RendererMap } from "./Renderer";

const renderers: RendererMap = {
  grid: [GridRenderer, getGridDefaults],
};

export function getRenderer(key = "") {
  return get(renderers, key, [DefaultRenderer, getDefaults] as RendererEntry);
}
