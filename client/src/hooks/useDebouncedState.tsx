import { delay, noop } from "lodash";
import { useState } from "react";
import { useEffectWhen } from "./useEffectWhen";

export function useDebouncedState<T>(
  defaultValue: T,
  onChange: (v: T) => void = noop,
  wait: number = 300
) {
  const [state, setState] = useState(defaultValue);
  useEffectWhen(
    () => {
      const timeout = delay(() => {
        onChange(state);
      }, wait);
      return () => clearTimeout(timeout);
    },
    [state, onChange, wait],
    [state]
  );
  return [state, setState] as const;
}
