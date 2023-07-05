import { TraceEventType } from "protocol/Trace";

export const eventTypes: (TraceEventType | "any")[] = [
  "any",
  "source",
  "destination",
  "expanding",
  "generating",
  "closing",
];
