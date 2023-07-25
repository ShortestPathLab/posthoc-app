import { makeTemplate } from "components/script-editor/makeTemplate";
import { templates } from "components/script-editor/templates";
import { values } from "lodash";
import { Feature } from "protocol/FeatureQuery";
import { Parameters } from "protocol/SolveTask";
import { Trace, TraceEventType } from "protocol/Trace";
import { createSlice } from "./createSlice";
import { nanoid as id } from "nanoid";
import { StackProps } from "@mui/material";

export type PlaybackStateType = "playing" | "paused" | undefined;

type PlaybackState = { playback?: PlaybackStateType; step?: number };

export type Map = Partial<
  Feature & {
    format: string;
    source?: string;
  }
>;

type InputState = {
  algorithm?: string;
  map?: Map;
  parameters?: Parameters;
};

export type Comparator = {
  key: string;
  apply: (value: number, reference: number) => boolean;
};

export type Breakpoint = {
  key: string;
  property?: string;
  reference?: number;
  condition?: Comparator;
  active?: boolean;
  type?: TraceEventType;
};

type DebugOptionsState = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
};

type SpecimenState = {
  start?: number;
  end?: number;
};

export type Layer = { key: string; name?: string } & {
  source?:
    | { type: "map"; map?: Map }
    | ({ type: "query" } & InputState & SpecimenState)
    | { type: "trace"; trace: Trace };
};

export type Node<T> = { size?: number };

export type Branch<T> = Node<T> & {
  type: "branch";
  key: string;
  orientation: "vertical" | "horizontal";
  children: Root<T>[];
};

export type Leaf<T> = Node<T> & {
  type: "leaf";
  key: string;
  content?: T;
};

export type Root<T> = Branch<T> | Leaf<T>;

export type ViewTreeState = { view: Root<PanelState> };

export type LayerState = {
  layers: Layer[];
};

export type PanelState = {
  type: string;
};

export type UIState = InputState &
  PlaybackState &
  DebugOptionsState &
  SpecimenState &
  LayerState &
  ViewTreeState;

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>({
  code: makeTemplate(values(templates)),
  layers: [{ key: id(), name: "Scene", source: { type: "map" } }],
  view: {
    type: "branch",
    key: id(),
    orientation: "horizontal",
    children: [
      {
        size: 80,
        type: "leaf",
        key: id(),
        content: { type: "viewport" },
      },
      {
        size: 20,
        type: "branch",
        key: id(),
        orientation: "vertical",
        children: [
          { type: "leaf", size: 50, key: id(), content: { type: "steps" } },
          {
            type: "leaf",
            size: 50,
            key: id(),
            content: { type: "layers" },
          },
        ],
      },
    ],
  },
});
