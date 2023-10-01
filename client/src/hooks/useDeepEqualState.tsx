import { isEqual } from "lodash";
import { useGetSet } from "react-use";
import { useEffect } from "react";

type Comparator<T> = (a: T, b: T) => boolean;

export function useDeepEqualState<T>(a: T, equal: Comparator<T> = isEqual) {
  const [getState, setState] = useGetSet(a);

  useEffect(() => {
    if (!equal(getState(), a)) setState(a);
  }, [a, getState, setState, equal]);

  return getState();
}