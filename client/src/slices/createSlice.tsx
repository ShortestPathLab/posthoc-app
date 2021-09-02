import { noop } from "lodash";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Slice<T> = [T, (next: T) => void];

export function createSlice<T>(
  initialState: T,
  initializer?: () => Promise<T>
) {
  const Store = createContext<Slice<T>>([initialState, noop]);
  return [
    // Hook
    () => useContext(Store),
    // Context
    ({ children }: { children?: ReactNode }) => {
      const [value, setValue] = useState(initialState);
      const slice = useMemo<Slice<T>>(
        () => [value, setValue],
        [value, setValue]
      );
      useEffect(() => void initializer?.().then?.(setValue), [setValue]);
      return <Store.Provider value={slice}>{children}</Store.Provider>;
    },
  ] as const;
}
