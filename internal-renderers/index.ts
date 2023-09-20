export * from "./src/d2-renderer";
import { Dictionary } from "lodash";
import { D2Renderer } from "./src/d2-renderer";
import { RendererDefinition } from "renderer";

export default {
  "d2-renderer": D2Renderer,
} as Dictionary<RendererDefinition<any, any, any>>;
