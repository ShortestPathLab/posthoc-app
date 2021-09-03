import { createSlice } from "./createSlice";

export type PlaybackStateType = "playing" | "paused" | undefined;

type PlaybackState = { playback?: PlaybackStateType; step?: number };

type InputState = {
  algorithm?: string;
  map?: string;
};

export type UIState = InputState & PlaybackState;

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>({}, undefined, (prev, next) => ({ ...prev, ...next }));
