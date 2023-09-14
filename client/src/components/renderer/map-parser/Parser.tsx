import { CompiledComponent } from "protocol";
import { ComponentEntry } from "renderer";
import { NodeMatcher } from "../NodeMatcher";
import { Bounds, Point } from "../Size";

export type MapParser = (map?: string, options?: any) => Promise<MapInfo>;

export type MapInfo = {
  log: string[];
  bounds: Bounds;
  nodes: ComponentEntry<CompiledComponent<string, {}>>[];
  snap: (point: Point, scale?: number) => Point | undefined;
  nodeAt: (point: Point) => number | undefined;
  pointOf: (node: number) => Point | undefined;
  matchNode: NodeMatcher;
};
