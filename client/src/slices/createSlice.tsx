import { noop } from "lodash";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

type Slice<T, U = T> = [T, (next: U) => void];

type Reducer<T, U> = (prev: T, next: U) => T;

const defaultReducer = (_: any, next: any) => next;

export function createSlice<T, U = T>(
  initialState: T,
  initializer?: () => Promise<U>,
  reducer: Reducer<T, U> = defaultReducer
) {
  const Store = createContext<Slice<T, U>>([initialState, noop]);
  return [
    // Hook
    () => useContext(Store),
    // Context
    ({ children }: { children?: ReactNode }) => {
      const [value, dispatch] = useReducer(reducer, initialState);
      const slice = useMemo<Slice<T, U>>(
        () => [value, dispatch],
        [value, dispatch]
      );
      useEffect(() => void initializer?.().then?.(dispatch), [dispatch]);
      return <Store.Provider value={slice}>{children}</Store.Provider>;
    },
  ] as const;
}
