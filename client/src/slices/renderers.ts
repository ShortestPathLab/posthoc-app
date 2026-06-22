import { store } from "@davstack/store";
import { RendererDefinition, RendererEvents, RendererOptions } from "renderer";

export type Renderer = {
  key: string;
  url: string;
  renderer: RendererDefinition<RendererOptions, RendererEvents, { $: string }>;
};

export const renderers = store<Renderer[]>([], {
  name: "renderers",
  devtools: { enabled: import.meta.env.DEV },
});
