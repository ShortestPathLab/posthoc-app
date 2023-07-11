import { useCallback } from "react";
import { createSlice } from "./createSlice";
import { some, values } from "lodash";

type Loading = {
  specimen?: boolean;
  map?: boolean;
  connections?: boolean;
  features?: boolean;
  parsedMap?: boolean;
};

export const [useLoading, LoadingProvider] = createSlice<Loading>({});

export function useAnyLoading() {
  const [loading] = useLoading();
  return some(values(loading));
}

export function useLoadingState(key: keyof Loading) {
  const [, setLoading] = useLoading();

  return useCallback(
    async <T>(task: () => Promise<T>) => {
      setLoading({ [key]: true });
      const out = await task();
      setLoading({ [key]: false });
      return out;
    },
    [key, setLoading]
  );
}
