import { Dictionary } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { Bounds } from "../Bounds";
import { Point } from "../Renderer";

export type MapInfo<M extends Dictionary<string> = {}> = {
  bounds: Bounds;
  nodes: {
    [K in keyof M]: TraceEvent<M[K]>[];
  };
  snap: (point: Point, scale?: number) => Point | undefined;
  nodeAt: (point: Point) => number | undefined;
  pointOf: (node: number) => Point | undefined;
};
