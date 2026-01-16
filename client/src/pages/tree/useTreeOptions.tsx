import { useStateWithKey } from "hooks/useStateWithKey";
import { has, head, keys } from "lodash-es";
import { useState } from "react";
import { layoutModes, SYMBOL_METRIC_STEP } from "./ScatterPlotControls";
import { useComputeLabels } from "./TreeUtility";
import { useTreePageState } from "./useTreePageState";

export function useTreeOptions(key?: string) {
  const { trace } = useTreePageState(key);
  const [mode, setMode] = useState<keyof typeof layoutModes>("tree");

  const { data: properties, isLoading: isPropertiesLoading } = useComputeLabels(
    {
      key: trace?.key,
      trace: trace?.content,
    },
  );

  const [trackedProperty, setTrackedProperty] = useStateWithKey(trace?.key, "");

  const [logAxis, setLogAxis] = useStateWithKey<{ x: boolean; y: boolean }>(
    trace?.key,
    {
      x: false,
      y: false,
    },
  );

  const [axis, setAxis] = useStateWithKey<{
    xMetric: string;
    yMetric: string;
  }>(`${trace?.key}::${isPropertiesLoading}`, () => ({
    xMetric: SYMBOL_METRIC_STEP,
    yMetric: has(properties, ".g")
      ? "g"
      : (head(keys(properties)) ?? SYMBOL_METRIC_STEP),
  }));

  const [typeFilter, setTypeFilter] = useStateWithKey<string>(trace?.key, "");

  const handleEventTypeChange = (value: string) => {
    const v = String(value ?? "");
    setTypeFilter(v);
  };

  const handleAxisChange = (a: keyof typeof axis) => (v: string) => {
    const raw = v ?? "";
    const sanitized = raw ? sanitizeMetricKey(raw) : "";

    if (!sanitized) return;

    setAxis((prev) => ({
      ...prev,
      [a]: sanitized,
    }));
  };

  const [groupByAttribute, setGroupByAttribute] = useState<string>("");

  const handleGroupByChange = (newValue: string) => {
    setGroupByAttribute(newValue);
  };
  return {
    setMode,
    setTrackedProperty,
    setLogAxis,
    isLoading: isPropertiesLoading,
    properties,
    mode,
    trackedProperty,
    logAxis,
    axis,
    typeFilter,
    groupByAttribute,
    setTypeFilter: handleEventTypeChange,
    setAxis: handleAxisChange,
    setGroupByAttribute: handleGroupByChange,
  };
}
export type TreeOptions = ReturnType<typeof useTreeOptions>;
export const sanitizeMetricKey = (key: string) => key.replace(/\./g, "");
