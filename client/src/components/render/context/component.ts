import { Context } from "../types/context"

export const DefaultD2RendererContext: Context = {
  current: null,
  parent: null,
  events: null,
  colour: {
    source: "#8bc34a",
    destination: "#f44336",
    expanding: "#ff5722",
    generating: "#ffeb3b",
    closing: "#b0bec5",
    end: "#ec407a",
  },
  scale: 15,
  fill: null,
  alpha: 1
}