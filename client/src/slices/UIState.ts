import { makeTemplate } from "components/script-editor/makeTemplate";
import { templates } from "components/script-editor/templates";
import { values } from "lodash";
import { Feature } from "protocol/FeatureQuery";
import { TraceEventType } from "protocol/Trace";
import { createSlice } from "./createSlice";

export type PlaybackStateType = "playing" | "paused" | undefined;

type PlaybackState = { playback?: PlaybackStateType; step?: number };

export type Map = Partial<
  Feature & {
    format: string;
    source?: string;
  }
>;

type SelectState = {
  algorithm?: string;
  map?: Map;
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

type InfoPanelState = {
  fixed?: boolean;
};

export type UIState = SelectState &
  PlaybackState &
  DebugOptionsState &
  SpecimenState &
  InfoPanelState;

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>({
  code: makeTemplate(values(templates)),
});
