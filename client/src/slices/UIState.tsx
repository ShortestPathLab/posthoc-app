import { createSlice } from "./createSlice";

type UIState = {
  algorithm?: string;
  map?: string;
};

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>({}, undefined, (prev, next) => ({ ...prev, ...next }));
