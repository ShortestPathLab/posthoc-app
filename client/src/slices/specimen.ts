import { createSlice } from "./createSlice";
import { Trace } from "protocol/Trace";
import { PathfindingTask } from "protocol/SolveTask";
import { ParamsOf } from "protocol/Message";
import { TraceViews } from "components/render/types/trace";
import { Event } from "components/render/types/render";
import { Context } from "components/render/types/context";

export type Interlang = TraceViews;

export type Specimen = {
  specimen?: Trace;
  interlang?: Interlang;
  eventList?: Event[];
  context?: Context;
  map?: string;
  error?: string;
} & Partial<ParamsOf<PathfindingTask>>;

export const [useSpecimen, SpecimenProvider] = createSlice<Specimen>({});
