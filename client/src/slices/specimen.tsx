import { createSlice } from "./createSlice";
import { Trace } from "protocol/Trace";
import { PathfindingTask } from "protocol/SolveTask";
import { ParamsOf } from "protocol/Message";

type Specimen = {
  specimen?: Trace;
} & Partial<ParamsOf<PathfindingTask>>;

export const [useSpecimen, SpecimenProvider] = createSlice<Specimen>({});
