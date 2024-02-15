import { filter, flow, isUndefined, keys, omit } from "lodash";
import { createSlice } from "./createSlice";
import { merge } from "./reducers";

const removeUndefinedValues = <T extends Record<string, any>>(obj: T) =>
  omit(
    obj,
    filter(keys(obj), (key) => isUndefined(obj[key]))
  );

export const [useScreenshots, ScreenshotsProvider] = createSlice<
  Record<string, (() => Promise<string | undefined>) | undefined>
>(
  {},
  {
    reduce: flow(merge, removeUndefinedValues),
  }
);
