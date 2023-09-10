import { isEqual } from "lodash";
import { useEffect } from "react";
import { useGetSet } from "react-use";

type Comparator<T> = (a: T, b: T) => boolean;

export function useDeepEqualState<T>(a: T, equal: Comparator<T> = isEqual) {
  const [getState, setState] = useGetSet(a);

  useEffect(() => {
    if (!equal(getState(), a)) setState(a);
  }, [a, getState, setState, equal]);

  return getState();
}
