import { createSlice } from "./createSlice";

type Loading = {
  specimen?: boolean;
  map?: boolean;
};

export const [useLoading, LoadingProvider] = createSlice<Loading>(
  {},
  undefined,
  (prev, next) => ({
    ...prev,
    ...next,
  })
);
