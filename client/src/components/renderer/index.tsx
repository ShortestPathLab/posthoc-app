import { get } from "lodash";
import { DefaultRenderer } from "./default";
import { GridRenderer } from "./grid";
import { MeshRenderer } from "./mesh";
import { NetworkRenderer } from "./network";
import { RendererMap, RendererProps } from "./Renderer";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { createElement } from "react";

export function JSONRenderer(props: RendererProps) {
  const [{ specimen }] = useSpecimen();
  const [{ parameters }] = useUIState();
  return createElement(renderers[parameters?.format], props);
}

const renderers: RendererMap = {
  grid: GridRenderer,
  xy: NetworkRenderer,
  mesh: MeshRenderer,
  json: JSONRenderer,
};

export function getRenderer(key = "") {
  return get(renderers, key, DefaultRenderer);
}
