import { createSlice } from "./createSlice";

export type PlaybackStateType = "playing" | "paused" | undefined;

type LogEntry = {
  content: string;
  timestamp?: string;
};

type Log = LogEntry[];

export const [useLog, LogProvider] = createSlice<Log, LogEntry>([], {
  reduce: (prev, next) => [next, ...prev],
});
