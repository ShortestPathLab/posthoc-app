import { createSlice } from "./createSlice";

type LogEntry = {
  content: string;
  timestamp?: string;
};

type Log = LogEntry[];

export const [useLog, LogProvider] = createSlice<Log, LogEntry>([], {
  reduce: (prev, next) => [next, ...prev],
});