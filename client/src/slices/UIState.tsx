import { makeTemplate } from "components/script-editor/makeTemplate";
import { templates } from "components/script-editor/templates";
import { values } from "lodash";
import { createSlice } from "./createSlice";

export type PlaybackStateType = "playing" | "paused" | undefined;

type PlaybackState = { playback?: PlaybackStateType; step?: number };

type InputState = {
  algorithm?: string;
  map?: string;
};

type DebugOptionsState = {
  code?: string;
};

export type UIState = InputState & PlaybackState & DebugOptionsState;

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
