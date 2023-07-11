import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { Trace } from "protocol/Trace";
import { createSlice } from "./createSlice";

export type SpecimenOld = {
  specimen?: Trace;
  map?: string;
  error?: string;
} & Partial<ParamsOf<PathfindingTask>>;

export type Specimen = {
  specimen?: Trace;
  map?: string;
  error?: string;
} & Partial<ParamsOf<PathfindingTask>>;

export const [useSpecimen, SpecimenProvider] = createSlice<SpecimenOld>({});
