import { get } from "lodash";
import { DefaultRenderer } from "./default-renderer/DefaultRenderer";
import { GridRenderer } from "./grid-renderer/GridRenderer";
import { getDefaults as getGridDefaults } from "./grid-renderer/getDefaults";
import { RendererMap, RendererEntry } from "./Renderer";

const getDefaults = () => ({
  start: 0,
  end: 0,
});

const renderers: RendererMap = {
  grid: [GridRenderer, getGridDefaults],
};

export function getRenderer(key = "") {
  return get(renderers, key, [DefaultRenderer, getDefaults] as RendererEntry);
}
