import { createSlice } from "./createSlice";
import { Layer } from "./UIState";

export type Specimen = {
  layers?: Layer[];
};

export const [useSpecimen, SpecimenProvider] = createSlice<Specimen>({});