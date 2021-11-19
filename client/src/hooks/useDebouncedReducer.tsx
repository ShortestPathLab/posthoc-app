import { useCallback, useMemo, useState } from "react";
import { merge, Reducer } from "slices/reducers";
import { debounce, noop } from "lodash";

export function useDebouncedReducer<T, U = Partial<T>>(
  initialValue: T,
  external?: (v: T) => void,
  reduce: Reducer<T, U> = merge,
  wait = 1000
) {
  const [current, setCurrent] = useState(initialValue);

  const debounced = useMemo(
    () => debounce(external ?? noop, wait),
    [external, wait]
  );

  const dispatch = useCallback(
    (v: U) => {
      const next = reduce(current, v);
      setCurrent(next);
      debounced(next);
    },
    [debounced, setCurrent, reduce, current]
  );

  return [current, dispatch] as const;
}
