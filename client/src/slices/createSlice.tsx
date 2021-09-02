import { noop } from "lodash";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export function createSlice<T>(
  initialState: T,
  initializer?: () => Promise<T>
) {
  type V = [T, (next: T) => void];
  const Store = createContext<V>([initialState, noop]);
  return [
    // Hook
    () => useContext(Store),
    // Context
    ({ children }: { children?: ReactNode }) => {
      const [state, setState] = useState(initialState);
      const value = useMemo<V>(() => [state, setState], [state, setState]);
      useEffect(() => void initializer?.().then?.(setState), [setState]);
      return <Store.Provider value={value}>{children}</Store.Provider>;
    },
  ] as const;
}
