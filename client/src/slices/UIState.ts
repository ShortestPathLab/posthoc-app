import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { Trace } from "protocol/Trace";
import { createSlice } from "./createSlice";

export type Map = Partial<
  Feature & {
    format: string;
    source?: string;
  }
>;

type BusyState = {
  busy?: { [K in string]: string };
};

export type Specimen = {
  specimen?: Trace;
  map?: string;
  error?: string;
} & Partial<ParamsOf<PathfindingTask>>;

export type UploadedTrace = FeatureDescriptor & {
  content?: Trace;
  source?: string;
  /**
   * Uniquely identifies a trace.
   */
  key?: string;
};

export type UIState = BusyState;

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>({
  busy: {},
});
