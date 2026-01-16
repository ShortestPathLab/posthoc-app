import { isFunction } from "lodash-es";
import { useEffect, useEffectEvent, useState } from "react";

export function useStateWithKey<T>(
  key: string | undefined,
  initialiser: T | (() => T),
) {
  const initialValue = isFunction(initialiser) ? initialiser() : initialiser;

  const [value, setValue] = useState<T>(initialValue);

  const reset = useEffectEvent(() => setValue(initialValue));

  useEffect(() => reset(), [key]);

  return [value, setValue] as const;
}
