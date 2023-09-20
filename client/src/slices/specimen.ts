import { Layer } from "./UIState";
import { createSlice } from "./createSlice";

export type Specimen = {
  layers?: Layer[];
};

export const [useSpecimen, SpecimenProvider] = createSlice<Specimen>({});
