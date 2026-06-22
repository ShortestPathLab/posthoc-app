import { flow, isUndefined } from "es-toolkit";
import { filter, keys, omit } from "es-toolkit/compat";
import { createSlice } from "./createSlice";
import { merge } from "./reducers";

const removeUndefinedValues = <T extends Record<string, unknown>>(obj: T) =>
  omit(
    obj,
    filter(keys(obj), (key) => isUndefined(obj[key])),
  );

export const [useScreenshots, ScreenshotsProvider] = createSlice<
  Record<string, (() => Promise<string | undefined>) | undefined>
>(
  {},
  {
    reduce: flow(merge, removeUndefinedValues),
  },
);
