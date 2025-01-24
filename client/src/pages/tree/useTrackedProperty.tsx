import { chain as _, keys } from "lodash";
import { Trace } from "protocol";
import { useEffect, useMemo, useState } from "react";

export function useTrackedProperty(trace: Trace | undefined) {
  const properties = useMemo(
    () =>
      _(trace?.events)
        .flatMap(keys)
        .uniq()
        .filter((p) => p !== "type")
        .value(),
    [trace?.events]
  );

  const [trackedProperty, setTrackedProperty] = useState<string>("");

  // Reset tracked property
  useEffect(() => {
    setTrackedProperty("");
  }, [trace, setTrackedProperty]);

  return [trackedProperty, setTrackedProperty, properties] as const;
}
