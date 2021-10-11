import { makeTemplate } from "components/script-editor/makeTemplate";
import { templates } from "components/script-editor/templates";
import { values } from "lodash";
import { Feature } from "protocol/FeatureQuery";
import { TraceEventType } from "protocol/Trace";
import { createSlice } from "./createSlice";

export type PlaybackStateType = "playing" | "paused" | undefined;

type PlaybackState = { playback?: PlaybackStateType; step?: number };

type InputState = {
  algorithm?: string;
  map?: Partial<Feature & { type: string }>;
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

export type UIState = InputState &
  PlaybackState &
  DebugOptionsState &
  SpecimenState;

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>(
  {
    code: makeTemplate(values(templates)),
  },
  undefined,
  (prev, next) => ({ ...prev, ...next })
);
