import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor";
import { UploadedTrace } from "slices/UIState";

export type DebugLayerData = {
  code?: string;
  breakpoints?: Breakpoint[];
  trace?: UploadedTrace;
};
