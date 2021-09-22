import { createSlice } from "./createSlice";
import { Trace } from "protocol/Trace";
import { PathfindingTask } from "protocol/SolveTask";

type Specimen = {
  specimen?: Trace;
} & Partial<PathfindingTask["params"]>;

export const [useSpecimen, SpecimenProvider] = createSlice<Specimen>({});
