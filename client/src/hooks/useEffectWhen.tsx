import { zip } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useAsyncAbortable } from "react-async-hook";

export const useEffectWhen = (
  effect: () => void,
  deps: any[],
  whenDeps: any[]
) => {
  const whenRef = useRef(whenDeps || []);
  const initial = whenRef.current === whenDeps;
  const whenDepsChanged =
    initial || !whenRef.current.every((w, i) => w === whenDeps[i]);
  whenRef.current = whenDeps;
  const nullDeps = deps.map(() => null);

  return useEffect(
    whenDepsChanged ? () => void effect() : () => {},
    whenDepsChanged ? deps : nullDeps
  );
};

function allSame(a: any[], b: any[]) {
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
