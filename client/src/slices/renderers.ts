import { RendererDefinition, RendererEvents, RendererOptions } from "renderer";
import { createSlice } from "./createSlice";
import { replace } from "./reducers";

export type Renderer = {
  key: string;
  url: string;
  renderer: RendererDefinition<RendererOptions, RendererEvents, any>;
};

export const [useRenderers, RendererProvider] = createSlice<Renderer[]>([], {
  reduce: replace,
});