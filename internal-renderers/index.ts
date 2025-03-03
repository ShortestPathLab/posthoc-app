export * from "./src/d2-renderer";
import { D2Renderer } from "./src/d2-renderer";
import { D2MinimalRenderer } from "./src/d2-minimal-renderer";
import { RendererDefinition } from "renderer";

export default {
  "d2-renderer": D2Renderer,
  "d2-minimal-renderer": D2MinimalRenderer,
} as Record<string, RendererDefinition<any, any, any>>;
