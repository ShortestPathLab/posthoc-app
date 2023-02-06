import { InstrinsicComponents } from "components/render/renderer/primitives/PixiPrimitives"
import { createSlice } from "./createSlice";


export type ParsedComponent = {
  $: keyof InstrinsicComponents;
  [key: string]: any;
}

export type ParsedComponents = ParsedComponent[] | undefined;

export type Interlang = {
  main?: ParsedComponents;
  [key: string]: ParsedComponents;
}

export const [useInterlang, InterlangProvider] = createSlice<Interlang>({});