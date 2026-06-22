import { store } from "@davstack/store";

export type LogEntry = {
  content: string;
  timestamp?: string;
};

export type Log = LogEntry[];

export const log = store<Log>([], {
  name: "log",
  devtools: { enabled: import.meta.env.DEV },
}).actions((a) => ({
  append: (entry: LogEntry) => a.set((l) => void l.unshift(entry)),
  clear: () => a.set([]),
}));
