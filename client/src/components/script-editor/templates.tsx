import { TraceEvent } from "protocol/Trace";
import { FunctionTemplate } from "./FunctionTemplate";
import { EventTree } from "pages/tree.worker";

export type ShouldBreak = FunctionTemplate<
  [number, TraceEvent, TraceEvent[], EventTree | void, EventTree[] | void],
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
    { name: "parent", type: "any" },
    { name: "children", type: "any" },
  ],
  defaultReturnValue: false,
  returnType: "boolean",
};

export const templates = {
  shouldBreak,
};
