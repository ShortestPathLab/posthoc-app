import { zip } from "lodash";
import { useEffect, useState } from "react";
import { useAsyncAbortable } from "react-async-hook";
import { usePrevious } from "react-use";

export const useEffectWhen = (
  effect: () => void,
  deps: any[],
  watch: any[]
) => {
  const prev = usePrevious(watch);
  return useEffect(() => {
    if (!allSame(watch, prev)) {
      effect();
    }
  }, [deps]);
};

function allSame(a?: any[], b?: any[]) {
  return zip(a, b).every(([x, y]) => x === y);
}

export const useEffectWhenAsync = (
  effect: (signal: AbortSignal) => Promise<void>,
  deps: any[] = [],
  whenDeps: any[] = []
) => {
  const [prevDeps, setDeps] = useState<any[]>(deps);
  const [prevWhenDeps, setWhenDeps] = useState<any[]>(whenDeps);

  useEffect(() => {
    if (!allSame(prevWhenDeps, whenDeps)) {
      setDeps(deps);
      setWhenDeps(whenDeps);
    }
  }, [deps, whenDeps, prevWhenDeps]);

  return useAsyncAbortable<void, any[]>(effect, [...prevDeps, ...prevWhenDeps]);
};
