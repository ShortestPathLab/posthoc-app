import { delay, noop, now } from "lodash";
import { useRef, useState } from "react";
import { useEffectWhen } from "./useEffectWhen";

export function useDebouncedState<T>(
  defaultValue: T,
  onChange: (v: T) => void = noop,
  wait: number = 300
) {
  const [state, setState] = useState(defaultValue);
  const head = useRef(now());
  return [
    state,
    (a: any) => {
      const commit = now();
      requestIdleCallback(
        () => {
          if (commit > head.current) {
            onChange?.(a);
            head.current = commit;
          }
        },
        { timeout: 300 }
      );
      setState(a);
    },
  ] as const;
}
