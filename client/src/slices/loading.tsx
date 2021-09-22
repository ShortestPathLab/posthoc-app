import { createSlice } from "./createSlice";

type Loading = {
  specimen?: boolean;
};

export const [useLoading, LoadingProvider] = createSlice<Loading>(
  {},
  undefined,
  (prev, next) => ({
    ...prev,
    ...next,
  })
);
