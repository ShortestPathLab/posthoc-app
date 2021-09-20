import { get } from "lodash";
import { DefaultRenderer } from "./default-renderer/DefaultRenderer";
import { GridRenderer } from "./grid-renderer/GridRenderer";

const renderers = {
  grid: GridRenderer,
};

export const getRenderer = (key = "") => get(renderers, key, DefaultRenderer);
