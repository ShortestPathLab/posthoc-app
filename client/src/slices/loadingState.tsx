import { createSlice } from "./createSlice";

type LoadingState = {
  specimen?: boolean;
};

export const [useLoadingState, LoadingStateProvider] =
  createSlice<LoadingState>({}, undefined, (prev, next) => ({
    ...prev,
    ...next,
  }));
