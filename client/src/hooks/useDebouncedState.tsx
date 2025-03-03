import { noop, now } from "lodash-es";
import { useRef, useState } from "react";

export function useDebouncedState<T>(
  defaultValue: T,
  onChange: (v: T) => void = noop,
  wait: number = 300
) {
  const [state, setState] = useState(defaultValue);
  const head = useRef(now());
  return [
    state,
    (a: T) => {
      const commit = now();
      requestIdleCallback(
        () => {
          if (commit > head.current) {
            onChange?.(a);
            head.current = commit;
          }
        },
        { timeout: wait }
      );
      setState(a);
    },
  ] as const;
}
export function useDebouncedState2<T>(
  defaultValue: T,
  onChange: (v: (prev: T) => T) => void = noop,
  wait: number = 300
) {
  const [state, setState] = useState(defaultValue);
  const head = useRef(now());
  return [
    state,
    (a: (prev: T) => T) => {
      const commit = now();
      requestIdleCallback(
        () => {
          if (commit > head.current) {
            onChange?.(a);
            head.current = commit;
          }
        },
        { timeout: wait }
      );
      setState(a(state));
    },
  ] as const;
}
