import { createSlice } from "./createSlice";
import { Trace } from "protocol/Trace";

export const [useSpecimen, SpecimenProvider] = createSlice<Trace | undefined>(
  undefined
);
