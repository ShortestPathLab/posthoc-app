import { useEffect, useRef } from "react";

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
