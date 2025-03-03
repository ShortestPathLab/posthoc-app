import { delay, isUndefined, omitBy } from "lodash-es";
import { useCallback } from "react";
import { createSlice } from "./createSlice";
import { merge } from "./reducers";

export const LARGE_FILE_B = 20 * 1024 * 1024;

type Busy = {
  [K in string]?: string;
};

export const [useBusy, BusyProvider] = createSlice<Busy>(
  {},
  { reduce: (a, b) => omitBy(merge(a, b), isUndefined) }
);

function wait(ms: number) {
  return new Promise((res) => delay(res, ms));
}

export function useBusyState(key: string) {
  const [, dispatch] = useBusy();

  return useCallback(
    async <T>(task: () => Promise<T>, description: string) => {
      dispatch(() => ({ [key]: description }));
      wait(300);
      const out = await task();
      dispatch(() => ({ [key]: undefined }));
      return out;
    },
    [key, dispatch]
  );
}

export function formatByte(b: number) {
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}
