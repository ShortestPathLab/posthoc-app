import { createElement } from "react";
import { mapParsers } from "./map-parser";
import { RendererMap, RendererProps } from "./Renderer";
import { useUIState } from "slices/UIState";

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