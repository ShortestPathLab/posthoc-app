import { zip } from "es-toolkit/compat";
import { useEffect, useState } from "react";
import { useAsyncAbortable } from "react-async-hook";
import { usePrevious } from "react-use";

export const useEffectWhen = <T, U>(effect: () => void, deps: T[], watch: U[]) => {
  const prev = usePrevious(watch);
  return useEffect(() => {
    if (!allSame(watch, prev)) {
      effect();
    }
    // `effect` is intentionally omitted: this hook re-runs only when `watch` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, watch, prev]);
};

function allSame<T>(a?: T[], b?: T[]) {
  return zip(a, b).every(([x, y]) => x === y);
}

export const useEffectWhenAsync = <T, U>(
  effect: (signal: AbortSignal) => Promise<void>,
  deps: T[] = [],
  whenDeps: U[] = [],
) => {
  const [prevDeps, setDeps] = useState<T[]>(deps);
  const [prevWhenDeps, setWhenDeps] = useState<U[]>(whenDeps);

  useEffect(() => {
    if (!allSame(prevWhenDeps, whenDeps)) {
      setDeps(deps);
      setWhenDeps(whenDeps);
    }
  }, [deps, whenDeps, prevWhenDeps]);

  return useAsyncAbortable<void, (T | U)[]>(effect, [...prevDeps, ...prevWhenDeps]);
};
