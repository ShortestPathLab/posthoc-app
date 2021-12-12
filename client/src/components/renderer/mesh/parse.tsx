import { makeMapParser } from "../Parser";
import { Structure } from "./Structure";

type Options = {};

export const parse = makeMapParser<Options, Structure>(() => ({
  bounds: { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 },
  nodes: {
    edges: [],
  },
  snap: () => undefined,
  nodeAt: () => undefined,
  pointOf: () => undefined,
}));
