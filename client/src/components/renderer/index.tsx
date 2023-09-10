import { createElement } from "react";
import { useUIState } from "slices/UIState";
import { RendererMap, RendererProps } from "./Renderer";
import { mapParsers } from "./map-parser";

export function JSONRenderer(props: RendererProps) {
  const [{ parameters }] = useUIState();
  return createElement(renderers[parameters?.format], props);
}

const renderers: RendererMap = {
  json: JSONRenderer,
};

export function getParser(key = "") {
  return mapParsers[key];
}
