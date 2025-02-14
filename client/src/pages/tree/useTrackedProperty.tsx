import { Trace } from "protocol";
import { useEffect, useState } from "react";
import { useComputeLabels } from "./TreeUtility";

export function useTrackedProperty(key?: string, trace?: Trace) {
  const { data: properties = {} } = useComputeLabels({
    key,
    trace: trace as any,
  });

  const [trackedProperty, setTrackedProperty] = useState<string>("");

  // Reset tracked property
  useEffect(() => {
    setTrackedProperty("");
  }, [trace, setTrackedProperty]);

  return [trackedProperty, setTrackedProperty, properties] as const;
}
