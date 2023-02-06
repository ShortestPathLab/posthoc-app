import { InstrinsicComponents } from "components/render/renderer/primitives/PixiPrimitives"
import { TraceViews } from "components/render/types/trace";
import { createSlice } from "./createSlice";

export type Interlang = TraceViews;

export const [useInterlang, InterlangProvider] = createSlice<Interlang>({});