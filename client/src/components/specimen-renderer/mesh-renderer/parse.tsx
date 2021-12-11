import { makeMapParser } from "../map-parser";

type Options = {};

export type Nodes = {
  edges: "cx" | "cy" | "y1" | "y2" | "x1" | "x2";
};

export const parse = makeMapParser<Options, Nodes>(() => ({
  bounds: { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 },
  nodes: {
    edges: [],
  },
  snap: () => undefined,
  nodeAt: () => undefined,
  pointOf: () => undefined,
}));
