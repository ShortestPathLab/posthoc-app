import { createSlice } from "./createSlice";

export type PlaybackStateType = "playing" | "paused" | undefined;

type PlaybackState = { playback?: PlaybackStateType; step?: number };

export const [usePlayback, PlaybackProvider] = createSlice<
  PlaybackState,
  Partial<PlaybackState>
>({ playback: "paused" });
