import { get } from "lodash";
import { DefaultRenderer } from "./default";
import { RendererMap, RendererProps } from "./Renderer";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { createElement } from "react";
import { mapParsers } from "./map-parser";

export function JSONRenderer(props: RendererProps) {
  const [{ specimen }] = useSpecimen();
  const [{ parameters }] = useUIState();
  return createElement(renderers[parameters?.format], props);
}

const renderers: RendererMap = {
  json: JSONRenderer,
};

export function getParser(key = "") {
  return mapParsers[key];
}
