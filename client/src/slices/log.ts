import { createSlice } from "./createSlice";

type LogEntry = {
  content: string;
  timestamp?: string;
};

type Log = LogEntry[];

type LogAction = { action: "append"; log: LogEntry } | { action: "clear" };

export const [useLog, LogProvider] = createSlice<Log, LogAction>([], {
  reduce: (prev, next) => {
    switch (next.action) {
      case "append":
        return [next.log, ...prev];
      case "clear":
        return [];
    }
  },
});
