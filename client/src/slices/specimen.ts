import { createSlice } from "./createSlice";
import { Trace } from "protocol/Trace";
import { PathfindingTask } from "protocol/SolveTask";
import { ParamsOf } from "protocol/Message";

export type Specimen = {
  specimen?: Trace;
  map?: string;
  error?: string;
} & Partial<ParamsOf<PathfindingTask>>;

export const [useSpecimen, SpecimenProvider] = createSlice<Specimen>({});
