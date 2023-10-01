import { TraceEvent } from "protocol/Trace";
import { FunctionTemplate } from "./FunctionTemplate";

export type ShouldBreak = FunctionTemplate<
  [number, TraceEvent, TraceEvent[]],
  boolean
>;

export const shouldBreak: ShouldBreak = {
  name: "shouldBreak",
  description:
    "Define in what situations the debugger should break, in addition to the conditions defined in the standard options.",
  params: [
    { name: "step", type: "number" },
    { name: "event", type: "any" },
    { name: "events", type: "any" },
  ],
  defaultReturnValue: false,
  returnType: "boolean",
};

export type ShouldRender = FunctionTemplate<
  [number, TraceEvent, TraceEvent[]],
  boolean
>;

export const shouldRender: ShouldRender = {
  name: "shouldRender",
  description: "Define which objects the renderer should display.",
  params: [
    { name: "step", type: "number" },
    { name: "event", type: "any" },
    { name: "events", type: "any" },
  ],
  defaultReturnValue: true,
  returnType: "boolean",
};

export const templates = {
  shouldRender,
  shouldBreak,
};