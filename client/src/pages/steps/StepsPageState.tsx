import { useEffect, useState } from "react";
import { useLayerPicker } from "slices/layers";
import { isStepsLayer } from "./StepsLayer";

export type StepsPageState = {
  layer?: string;
  selectedType?: string;
  showHighlighting?: boolean;
};
export function useStepsPageState(
  state?: StepsPageState,
  onChange?: (r: StepsPageState) => void
) {
  "use no memo";

  const { key, setKey: setLocalKey } = useLayerPicker(isStepsLayer);
  useEffect(() => setLocalKey(state?.layer), [state?.layer]);

  const [selectedType, setLocalSelectedType] = useState(state?.selectedType);

  function setKey(k: string) {
    onChange?.({ layer: k });
    setLocalKey(k);
  }

  function setSelectedType(t: string) {
    onChange?.({ selectedType: t });
    setLocalSelectedType(t);
  }

  return {
    setSelectedType,
    setKey,
    selectedType,
    key,
  };
}
