import { CompiledComponent } from "protocol";
import { ComponentEntry } from "renderer";
import { NodeMatcher } from "../NodeMatcher";
import { Bounds, Point } from "../Size";
import { FC } from "react";
import { EditorSetterProps } from "components/Editor";

export type MapParser = (map?: string, options?: any) => Promise<ParsedMap>;
export type ParsedMapHydrator = (result: ParsedMap) => ParsedMap & MapUtils;
export type MapEditor<Options> = (
  map?: string
) => Promise<FC<EditorSetterProps<Options>>>;

export type ParsedMap = {
  content?: string;
  log: string[];
  bounds: Bounds;
  nodes: ComponentEntry<CompiledComponent<string, Record<string, any>>>[];
};

export type MapUtils = {
  snap: (point: Point, scale?: number) => Point | undefined;
  nodeAt: (point: Point) => number | undefined;
  pointOf: (node: number) => Point | undefined;
  matchNode: NodeMatcher;
};
